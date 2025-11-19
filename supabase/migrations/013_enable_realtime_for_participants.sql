-- SportNS Database Migration
-- Migration 013: Enable realtime for game_participants
-- Purpose: Allow real-time notifications when players join games

-- Enable realtime on game_participants for player join notifications
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;

-- Add comment
COMMENT ON TABLE game_participants IS 'Realtime enabled for player join notifications (Migration 013)';

