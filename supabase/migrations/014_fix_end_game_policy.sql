-- Migration 014: Fix end game RLS policy
-- Allow any participant to end a game, not just the creator

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Creators can update their own game events" ON game_events;

-- Create two separate policies for better clarity and to avoid OLD/NEW reference issues

-- Policy 1: Creators can update all fields of their own games
CREATE POLICY "Creators can update their own game events"
  ON game_events FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Policy 2: Any participant can end the game (set status to completed)
-- We use a function to validate this more cleanly
CREATE OR REPLACE FUNCTION can_participant_end_game(game_uuid UUID, new_status game_status)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow if the new status is 'completed'
  IF new_status = 'completed' THEN
    RETURN EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_id = game_uuid
      AND player_id = auth.uid()
    );
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "Participants can end games"
  ON game_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_participants.game_id = game_events.id
      AND game_participants.player_id = auth.uid()
    )
    AND status != 'completed' -- Only if not already completed
  )
  WITH CHECK (
    can_participant_end_game(id, status)
  );

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION can_participant_end_game(UUID, game_status) TO authenticated;

-- Add comment explaining the policies
COMMENT ON POLICY "Creators can update their own game events" ON game_events IS 
  'Allows game creators to update all fields of their games';
COMMENT ON POLICY "Participants can end games" ON game_events IS 
  'Allows any participant to end the game by setting status to completed';

