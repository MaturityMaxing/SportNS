-- Migration 009: Auto-end games 2 hours after their scheduled start time
-- This prevents games from staying open indefinitely

-- Create a function to automatically end games that are 2 hours past their scheduled time
CREATE OR REPLACE FUNCTION auto_end_old_games()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update games that are:
  -- 1. Still waiting or confirmed (not already ended or cancelled)
  -- 2. Scheduled time was more than 2 hours ago
  UPDATE game_events
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE 
    status IN ('waiting', 'confirmed')
    AND scheduled_time < NOW() - INTERVAL '2 hours';
END;
$$;

-- Create a cron job to run this function every 15 minutes
-- Note: This requires pg_cron extension which should be enabled in your Supabase project
-- You can also trigger this function manually or via an external cron job

-- For Supabase, you can set this up in the SQL Editor:
-- SELECT cron.schedule(
--   'auto-end-old-games',
--   '*/15 * * * *',  -- Every 15 minutes
--   $$SELECT auto_end_old_games()$$
-- );

-- Alternative: Create a trigger that checks on game updates
-- This will check whenever any game is accessed
CREATE OR REPLACE FUNCTION check_game_timeout_on_read()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If this game should be auto-ended, end it now
  IF NEW.status IN ('waiting', 'confirmed') 
     AND NEW.scheduled_time < NOW() - INTERVAL '2 hours' THEN
    NEW.status := 'completed';
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Apply the trigger on game_events table
DROP TRIGGER IF EXISTS trigger_check_game_timeout ON game_events;
CREATE TRIGGER trigger_check_game_timeout
  BEFORE UPDATE ON game_events
  FOR EACH ROW
  EXECUTE FUNCTION check_game_timeout_on_read();

-- Also run the function once immediately to clean up any existing old games
SELECT auto_end_old_games();

