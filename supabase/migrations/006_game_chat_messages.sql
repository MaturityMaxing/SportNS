-- SportNS Database Migration
-- Migration 006: Game Chat Messages
-- Purpose: Add real-time chat functionality for game participants

-- ============================================================================
-- PART 1: Create Game Chat Messages Table
-- ============================================================================

-- Create game chat messages table
CREATE TABLE game_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (length(message) > 0 AND length(message) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_game_chat_messages_game ON game_chat_messages(game_id);
CREATE INDEX idx_game_chat_messages_sender ON game_chat_messages(sender_id);
CREATE INDEX idx_game_chat_messages_created_at ON game_chat_messages(created_at DESC);

-- Composite index for fetching game messages in order
CREATE INDEX idx_game_chat_messages_game_time ON game_chat_messages(game_id, created_at DESC);

-- ============================================================================
-- PART 2: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on game_chat_messages
ALTER TABLE game_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Only participants of the game can view chat messages
CREATE POLICY "Game participants can view chat messages"
  ON game_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_participants gp
      WHERE gp.game_id = game_chat_messages.game_id
      AND gp.player_id = auth.uid()
    )
  );

-- Policy: Only participants can send chat messages
CREATE POLICY "Game participants can send chat messages"
  ON game_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM game_participants gp
      WHERE gp.game_id = game_chat_messages.game_id
      AND gp.player_id = auth.uid()
    )
  );

-- Policy: No updates allowed (messages are immutable)
-- (No policy needed - default deny)

-- Policy: No deletes allowed (messages are permanent)
-- (No policy needed - default deny)

-- ============================================================================
-- PART 3: Helper Functions
-- ============================================================================

-- Function to get recent chat messages for a game
CREATE OR REPLACE FUNCTION get_game_chat_messages(
  game_uuid UUID,
  message_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  game_id UUID,
  sender_id UUID,
  sender_username TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gcm.id,
    gcm.game_id,
    gcm.sender_id,
    COALESCE(p.username, p.discord_username, 'Unknown') AS sender_username,
    gcm.message,
    gcm.created_at
  FROM game_chat_messages gcm
  JOIN profiles p ON p.id = gcm.sender_id
  WHERE gcm.game_id = game_uuid
  ORDER BY gcm.created_at DESC
  LIMIT message_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_game_chat_messages(UUID, INT) TO authenticated;

-- ============================================================================
-- PART 4: Realtime Configuration
-- ============================================================================

-- Enable realtime for game_chat_messages table
-- This allows Supabase to broadcast INSERT events in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE game_chat_messages;

-- ============================================================================
-- PART 5: Comments and Documentation
-- ============================================================================

COMMENT ON TABLE game_chat_messages IS 'Real-time chat messages for game participants (Migration 006)';
COMMENT ON COLUMN game_chat_messages.message IS 'Plain text message content, max 1000 characters';
COMMENT ON FUNCTION get_game_chat_messages(UUID, INT) IS 'Fetches recent chat messages for a game with sender usernames';

-- ============================================================================
-- Migration Complete
-- ============================================================================

