-- SportNS Database Migration
-- Migration 011: Notification Settings
-- Purpose: Add notification preferences for users

-- ============================================================================
-- PART 1: Notification Settings Table
-- ============================================================================

-- Create notification settings table (if not exists)
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notify_30min_before_game BOOLEAN DEFAULT true,
  notify_5min_before_game BOOLEAN DEFAULT true,
  notify_new_chat_message BOOLEAN DEFAULT true,
  notify_player_joins_game BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: RLS Policies
-- ============================================================================

-- Users can view their own notification settings
DROP POLICY IF EXISTS "Users can view their own notification settings" ON notification_settings;
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notification settings
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON notification_settings;
CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification settings
DROP POLICY IF EXISTS "Users can update their own notification settings" ON notification_settings;
CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notification settings
DROP POLICY IF EXISTS "Users can delete their own notification settings" ON notification_settings;
CREATE POLICY "Users can delete their own notification settings"
  ON notification_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: Helper Functions
-- ============================================================================

-- Function to create default notification settings for new users
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default notification settings when profile is created
DROP TRIGGER IF EXISTS trigger_create_default_notification_settings ON profiles;
CREATE TRIGGER trigger_create_default_notification_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_settings();

-- ============================================================================
-- PART 4: Notification Queue Table (for scheduled notifications)
-- ============================================================================

-- Create notification status enum (if not exists)
DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM (
    'pending',
    'sent',
    'failed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create notification type enum (if not exists)
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'game_30min_reminder',
    'game_5min_reminder',
    'chat_message',
    'player_joined'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create notification queue table (if not exists)
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  game_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status notification_status DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_game ON notification_queue(game_id);

-- Composite index for finding pending notifications to send
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending ON notification_queue(status, scheduled_for)
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notification_queue;
CREATE POLICY "Users can view their own notifications"
  ON notification_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert/update notifications (handled by backend/triggers)
DROP POLICY IF EXISTS "Service role can manage notifications" ON notification_queue;
CREATE POLICY "Service role can manage notifications"
  ON notification_queue FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 5: Functions to Schedule Notifications
-- ============================================================================

-- Function to schedule game reminder notifications
CREATE OR REPLACE FUNCTION schedule_game_reminder_notifications()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
  user_settings RECORD;
  notify_30min_time TIMESTAMP WITH TIME ZONE;
  notify_5min_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only schedule for new games that are waiting or confirmed
  IF TG_OP = 'INSERT' AND NEW.status IN ('waiting', 'confirmed') THEN
    -- Calculate notification times
    notify_30min_time := NEW.scheduled_time - INTERVAL '30 minutes';
    notify_5min_time := NEW.scheduled_time - INTERVAL '5 minutes';

    -- Schedule notifications for all participants
    FOR participant_record IN 
      SELECT DISTINCT gp.player_id 
      FROM game_participants gp 
      WHERE gp.game_id = NEW.id
    LOOP
      -- Get user's notification settings
      SELECT * INTO user_settings 
      FROM notification_settings 
      WHERE user_id = participant_record.player_id;

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
          NEW.id,
          'Game starting soon!',
          'Your game starts in 30 minutes',
          notify_30min_time,
          jsonb_build_object('game_id', NEW.id, 'sport_id', NEW.sport_id)
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
          NEW.id,
          'Game starting very soon!',
          'Your game starts in 5 minutes',
          notify_5min_time,
          jsonb_build_object('game_id', NEW.id, 'sport_id', NEW.sport_id)
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule notifications when a participant joins
CREATE OR REPLACE FUNCTION notify_on_player_join()
RETURNS TRIGGER AS $$
DECLARE
  game_record RECORD;
  participant_record RECORD;
  user_settings RECORD;
  joining_player_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get game details
    SELECT * INTO game_record FROM game_events WHERE id = NEW.game_id;
    
    -- Get joining player's name
    SELECT COALESCE(username, discord_username, 'A player') INTO joining_player_name
    FROM profiles WHERE id = NEW.player_id;

    -- Notify all OTHER participants (not the one who just joined)
    FOR participant_record IN 
      SELECT DISTINCT gp.player_id 
      FROM game_participants gp 
      WHERE gp.game_id = NEW.game_id 
        AND gp.player_id != NEW.player_id
    LOOP
      -- Get user's notification settings
      SELECT * INTO user_settings 
      FROM notification_settings 
      WHERE user_id = participant_record.player_id;

      -- Send notification if enabled
      IF user_settings.notify_player_joins_game THEN
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
          'player_joined',
          NEW.game_id,
          'New player joined!',
          joining_player_name || ' joined your game',
          NOW(),
          jsonb_build_object('game_id', NEW.game_id, 'player_id', NEW.player_id)
        );
      END IF;
    END LOOP;

    -- Schedule game reminder notifications for the new participant
    SELECT * INTO user_settings 
    FROM notification_settings 
    WHERE user_id = NEW.player_id;

    IF user_settings IS NOT NULL THEN
      -- Schedule 30-minute reminder if enabled
      IF user_settings.notify_30min_before_game 
         AND game_record.scheduled_time - INTERVAL '30 minutes' > NOW() THEN
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
          NEW.player_id,
          'game_30min_reminder',
          NEW.game_id,
          'Game starting soon!',
          'Your game starts in 30 minutes',
          game_record.scheduled_time - INTERVAL '30 minutes',
          jsonb_build_object('game_id', NEW.game_id, 'sport_id', game_record.sport_id)
        );
      END IF;

      -- Schedule 5-minute reminder if enabled
      IF user_settings.notify_5min_before_game 
         AND game_record.scheduled_time - INTERVAL '5 minutes' > NOW() THEN
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
          NEW.player_id,
          'game_5min_reminder',
          NEW.game_id,
          'Game starting very soon!',
          'Your game starts in 5 minutes',
          game_record.scheduled_time - INTERVAL '5 minutes',
          jsonb_build_object('game_id', NEW.game_id, 'sport_id', game_record.sport_id)
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify when player joins game
DROP TRIGGER IF EXISTS trigger_notify_on_player_join ON game_participants;
CREATE TRIGGER trigger_notify_on_player_join
  AFTER INSERT ON game_participants
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_player_join();

-- ============================================================================
-- PART 6: Chat Message Notifications
-- ============================================================================

-- Function to notify on new chat message
CREATE OR REPLACE FUNCTION notify_on_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
  user_settings RECORD;
  sender_name TEXT;
  sport_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get sender's name
    SELECT COALESCE(username, discord_username, 'A player') INTO sender_name
    FROM profiles WHERE id = NEW.sender_id;

    -- Get sport name for context
    SELECT s.name INTO sport_name
    FROM game_events ge
    JOIN sports s ON s.id = ge.sport_id
    WHERE ge.id = NEW.game_id;

    -- Notify all OTHER participants (not the sender)
    FOR participant_record IN 
      SELECT DISTINCT gp.player_id 
      FROM game_participants gp 
      WHERE gp.game_id = NEW.game_id 
        AND gp.player_id != NEW.sender_id
    LOOP
      -- Get user's notification settings
      SELECT * INTO user_settings 
      FROM notification_settings 
      WHERE user_id = participant_record.player_id;

      -- Send notification if enabled
      IF user_settings.notify_new_chat_message THEN
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
          'chat_message',
          NEW.game_id,
          'New message in ' || COALESCE(sport_name, 'game'),
          sender_name || ': ' || LEFT(NEW.message, 50) || CASE WHEN LENGTH(NEW.message) > 50 THEN '...' ELSE '' END,
          NOW(),
          jsonb_build_object('game_id', NEW.game_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id)
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify when chat message is sent
DROP TRIGGER IF EXISTS trigger_notify_on_chat_message ON game_chat_messages;
CREATE TRIGGER trigger_notify_on_chat_message
  AFTER INSERT ON game_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_chat_message();

-- ============================================================================
-- PART 7: Grant Permissions
-- ============================================================================

-- Grant usage on enums
GRANT USAGE ON TYPE notification_status TO authenticated;
GRANT USAGE ON TYPE notification_type TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE notification_settings IS 'User notification preferences (Migration 011)';
COMMENT ON TABLE notification_queue IS 'Queue for scheduled push notifications (Migration 011)';

