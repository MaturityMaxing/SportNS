-- Migration 017: Fix Notification System Triggers
-- Purpose: Add missing triggers and fix game reminder scheduling logic
-- Fixes:
--   1. Add trigger to call schedule_game_reminder_notifications()
--   2. Fix timing issue where creator reminders weren't scheduled
--   3. Ensure all notification types work properly
--
-- IMPORTANT: This migration requires migration 011 to be run first!
-- If you get "function does not exist" errors, run migration 011 first.

-- ============================================================================
-- PART 0: Prerequisites Check
-- ============================================================================

-- Verify that migration 011 has been run
DO $$
BEGIN
  -- Check if required functions exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'notify_on_chat_message'
  ) THEN
    RAISE EXCEPTION 'Migration 011 has not been run! Please run 011_notification_settings.sql first.';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'notify_on_player_join'
  ) THEN
    RAISE EXCEPTION 'Migration 011 has not been run! Please run 011_notification_settings.sql first.';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'schedule_game_reminder_notifications'
  ) THEN
    RAISE EXCEPTION 'Migration 011 has not been run! Please run 011_notification_settings.sql first.';
  END IF;
  
  -- Check if notification_queue table exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'notification_queue'
  ) THEN
    RAISE EXCEPTION 'notification_queue table does not exist! Please run migration 011 first.';
  END IF;
  
  RAISE NOTICE 'Prerequisites check passed. All required functions and tables exist.';
END $$;

-- ============================================================================
-- PART 1: Add Missing Trigger for Game Reminders on Game Creation
-- ============================================================================

-- This trigger was missing! It should fire when a game is created,
-- but at that point no participants exist yet, so we need a different approach.
-- We'll keep this for future-proofing but the real logic is in PART 2.

DROP TRIGGER IF EXISTS trigger_schedule_game_reminders_on_create ON game_events;
CREATE TRIGGER trigger_schedule_game_reminders_on_create
  AFTER INSERT ON game_events
  FOR EACH ROW
  EXECUTE FUNCTION schedule_game_reminder_notifications();

-- ============================================================================
-- PART 2: Fix the Reminder Scheduling Logic
-- ============================================================================

-- The problem: When a game is created, participants don't exist yet.
-- The creator is added separately in a client call, and other players join later.
-- Solution: Schedule reminders when each participant JOINS the game.

-- This function already exists and handles new participants joining.
-- We need to ensure it's being called. Let's verify the trigger exists:

-- The trigger should already exist from migration 011 (trigger_notify_on_player_join)
-- Let's recreate it to be sure it's there:

DROP TRIGGER IF EXISTS trigger_notify_on_player_join ON game_participants;
CREATE TRIGGER trigger_notify_on_player_join
  AFTER INSERT ON game_participants
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_player_join();

-- ============================================================================
-- PART 3: Verify Chat Message Notification Trigger
-- ============================================================================

-- Make sure the chat message trigger exists and is active
DROP TRIGGER IF EXISTS trigger_notify_on_chat_message ON game_chat_messages;
CREATE TRIGGER trigger_notify_on_chat_message
  AFTER INSERT ON game_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_chat_message();

-- ============================================================================
-- PART 4: Add Helper Function to Manually Re-schedule Reminders
-- ============================================================================

-- This function can be called to re-schedule reminders for existing games
-- Useful for games that were created before this fix
CREATE OR REPLACE FUNCTION reschedule_game_reminders_for_game(game_uuid UUID)
RETURNS void AS $$
DECLARE
  game_record RECORD;
  participant_record RECORD;
  user_settings RECORD;
  notify_30min_time TIMESTAMP WITH TIME ZONE;
  notify_5min_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get game details
  SELECT * INTO game_record FROM game_events WHERE id = game_uuid;
  
  IF game_record IS NULL THEN
    RAISE EXCEPTION 'Game not found: %', game_uuid;
  END IF;

  -- Calculate notification times
  notify_30min_time := game_record.scheduled_time - INTERVAL '30 minutes';
  notify_5min_time := game_record.scheduled_time - INTERVAL '5 minutes';

  -- Delete any existing pending reminders for this game
  DELETE FROM notification_queue 
  WHERE game_id = game_uuid 
    AND notification_type IN ('game_30min_reminder', 'game_5min_reminder')
    AND status = 'pending';

  -- Schedule notifications for all current participants
  FOR participant_record IN 
    SELECT DISTINCT gp.player_id 
    FROM game_participants gp 
    WHERE gp.game_id = game_uuid
  LOOP
    -- Get user's notification settings
    SELECT * INTO user_settings 
    FROM notification_settings 
    WHERE user_id = participant_record.player_id;

    IF user_settings IS NULL THEN
      CONTINUE; -- Skip if no settings
    END IF;

    -- Schedule 30-minute reminder if enabled and time is in future
    IF user_settings.notify_30min_before_game AND notify_30min_time > NOW() THEN
      INSERT INTO notification_queue (
        user_id, 
        notification_type, 
        game_id, 
        title, 
        body, 
        scheduled_for,
        data
      )
      VALUES (
        participant_record.player_id,
        'game_30min_reminder',
        game_uuid,
        'Game starting soon!',
        'Your game starts in 30 minutes',
        notify_30min_time,
        jsonb_build_object('game_id', game_uuid, 'sport_id', game_record.sport_id)
      );
    END IF;

    -- Schedule 5-minute reminder if enabled and time is in future
    IF user_settings.notify_5min_before_game AND notify_5min_time > NOW() THEN
      INSERT INTO notification_queue (
        user_id, 
        notification_type, 
        game_id, 
        title, 
        body, 
        scheduled_for,
        data
      )
      VALUES (
        participant_record.player_id,
        'game_5min_reminder',
        game_uuid,
        'Game starting very soon!',
        'Your game starts in 5 minutes',
        notify_5min_time,
        jsonb_build_object('game_id', game_uuid, 'sport_id', game_record.sport_id)
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Rescheduled reminders for game %', game_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: Reschedule Reminders for All Existing Future Games
-- ============================================================================

-- Fix any existing games that don't have reminders scheduled
DO $$
DECLARE
  game_record RECORD;
BEGIN
  FOR game_record IN 
    SELECT id 
    FROM game_events 
    WHERE status IN ('waiting', 'confirmed') 
      AND scheduled_time > NOW() + INTERVAL '5 minutes'
  LOOP
    BEGIN
      PERFORM reschedule_game_reminders_for_game(game_record.id);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error rescheduling game %: %', game_record.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- PART 6: Add Index for Better Performance
-- ============================================================================

-- Index to quickly find active games by scheduled time and status
-- Note: Can't use NOW() in index predicate (not IMMUTABLE), so we index all active games
CREATE INDEX IF NOT EXISTS idx_game_events_future_active 
  ON game_events(scheduled_time, status) 
  WHERE status IN ('waiting', 'confirmed');

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON FUNCTION reschedule_game_reminders_for_game(UUID) IS 
  'Manually reschedule game reminders for a specific game (Migration 017)';

