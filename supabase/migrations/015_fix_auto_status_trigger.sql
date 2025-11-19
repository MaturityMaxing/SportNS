-- Migration 015: Fix auto status update trigger to work with new RLS policies
-- The trigger that auto-updates game status needs SECURITY DEFINER to bypass RLS

-- Recreate the function with SECURITY DEFINER
-- This allows the automatic status updates to work even with strict RLS policies
CREATE OR REPLACE FUNCTION update_game_status_on_participant_change()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  min_req INT;
  game_uuid UUID;
BEGIN
  -- Determine the game_id from INSERT or DELETE
  IF TG_OP = 'INSERT' THEN
    game_uuid := NEW.game_id;
  ELSIF TG_OP = 'DELETE' THEN
    game_uuid := OLD.game_id;
  END IF;

  -- Get current participant count and min requirement
  SELECT 
    COUNT(*)::INT,
    ge.min_players
  INTO current_count, min_req
  FROM game_participants gp
  JOIN game_events ge ON ge.id = gp.game_id
  WHERE gp.game_id = game_uuid
  GROUP BY ge.min_players;

  -- If no participants left after deletion, the game will be handled separately
  IF current_count = 0 AND TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  -- Update game status based on participant count
  -- SECURITY DEFINER allows this to bypass RLS policies
  IF current_count >= min_req THEN
    UPDATE game_events
    SET status = 'confirmed'
    WHERE id = game_uuid AND status = 'waiting';
  ELSE
    UPDATE game_events
    SET status = 'waiting'
    WHERE id = game_uuid AND status = 'confirmed';
  END IF;

  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the auto_end_old_games function to use SECURITY DEFINER
-- (it was already there but let's make sure)
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

-- Update the timeout check function as well
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

COMMENT ON FUNCTION update_game_status_on_participant_change() IS 
  'Automatically updates game status when participants join/leave. Uses SECURITY DEFINER to bypass RLS.';
COMMENT ON FUNCTION auto_end_old_games() IS 
  'Automatically ends games that are 2+ hours past scheduled time. Uses SECURITY DEFINER to bypass RLS.';
COMMENT ON FUNCTION check_game_timeout_on_read() IS 
  'Checks and updates game timeout on read. Uses SECURITY DEFINER to bypass RLS.';

