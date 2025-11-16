-- Migration 007: Auto-cancel games with 0 players
-- When a player leaves a game, check if there are 0 players left and auto-cancel

-- Function to check and cancel empty games
CREATE OR REPLACE FUNCTION check_and_cancel_empty_game()
RETURNS TRIGGER AS $$
DECLARE
  remaining_players INTEGER;
BEGIN
  -- Count remaining players in the game
  SELECT COUNT(*)
  INTO remaining_players
  FROM game_participants
  WHERE game_id = OLD.game_id;

  -- If no players remain, cancel the game
  IF remaining_players = 0 THEN
    UPDATE game_events
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = OLD.game_id
      AND status IN ('waiting', 'confirmed'); -- Only cancel active games
    
    -- Log the cancellation
    RAISE NOTICE 'Game % auto-cancelled due to 0 players', OLD.game_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger that runs after a player is removed from a game
CREATE TRIGGER auto_cancel_empty_games
  AFTER DELETE ON game_participants
  FOR EACH ROW
  EXECUTE FUNCTION check_and_cancel_empty_game();

-- Add a comment to explain the trigger
COMMENT ON TRIGGER auto_cancel_empty_games ON game_participants IS 
  'Automatically cancels games when the last player leaves';

