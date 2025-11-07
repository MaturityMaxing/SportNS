-- SportNS Database Migration
-- Migration 005: Simplified Auth and Game Events
-- Purpose: Add username auth, skill levels, and game broadcast system

-- ============================================================================
-- PART 1: Modify Profiles Table
-- ============================================================================

-- Make Discord fields optional (preserve for future re-integration)
ALTER TABLE profiles 
  ALTER COLUMN discord_id DROP NOT NULL,
  ALTER COLUMN discord_username DROP NOT NULL;

-- Add username field for simplified auth
ALTER TABLE profiles 
  ADD COLUMN username TEXT UNIQUE;

-- Add onboarding completion flag
ALTER TABLE profiles 
  ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- ============================================================================
-- PART 2: Player Skill Levels Table
-- ============================================================================

-- Create skill level type
CREATE TYPE skill_level_type AS ENUM (
  'never_played',
  'beginner',
  'average',
  'pro',
  'expert'
);

-- Create player skill levels table
CREATE TABLE player_skill_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  skill_level skill_level_type NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, sport_id)
);

-- Indexes for performance
CREATE INDEX idx_player_skill_levels_player ON player_skill_levels(player_id);
CREATE INDEX idx_player_skill_levels_sport ON player_skill_levels(sport_id);
CREATE INDEX idx_player_skill_levels_skill ON player_skill_levels(skill_level);

-- Trigger for updated_at
CREATE TRIGGER update_player_skill_levels_updated_at
  BEFORE UPDATE ON player_skill_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 3: Game Events Table
-- ============================================================================

-- Create time type enum
CREATE TYPE time_type AS ENUM (
  'now',
  'time_of_day',
  'precise'
);

-- Create game status enum
CREATE TYPE game_status AS ENUM (
  'waiting',
  'confirmed',
  'completed',
  'cancelled'
);

-- Create game events table
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  min_players INT NOT NULL CHECK (min_players > 0),
  max_players INT NOT NULL CHECK (max_players >= min_players),
  skill_level_min skill_level_type,
  skill_level_max skill_level_type,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  time_type time_type NOT NULL,
  time_label TEXT,
  status game_status DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_game_events_sport ON game_events(sport_id);
CREATE INDEX idx_game_events_creator ON game_events(creator_id);
CREATE INDEX idx_game_events_status ON game_events(status);
CREATE INDEX idx_game_events_scheduled_time ON game_events(scheduled_time);
CREATE INDEX idx_game_events_created_at ON game_events(created_at DESC);

-- Composite index for dashboard queries (active games by sport)
CREATE INDEX idx_game_events_active ON game_events(status, sport_id, scheduled_time) 
  WHERE status IN ('waiting', 'confirmed');

-- Trigger for updated_at
CREATE TRIGGER update_game_events_updated_at
  BEFORE UPDATE ON game_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 4: Game Participants Table
-- ============================================================================

-- Create game participants table
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Indexes for performance
CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_game_participants_player ON game_participants(player_id);
CREATE INDEX idx_game_participants_joined_at ON game_participants(joined_at);

-- ============================================================================
-- PART 5: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE player_skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Player Skill Levels Policies
-- ============================================================================

-- Everyone can view skill levels (needed for game filtering)
CREATE POLICY "Skill levels are viewable by everyone"
  ON player_skill_levels FOR SELECT
  USING (true);

-- Users can insert their own skill levels
CREATE POLICY "Users can insert their own skill levels"
  ON player_skill_levels FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Users can update their own skill levels
CREATE POLICY "Users can update their own skill levels"
  ON player_skill_levels FOR UPDATE
  USING (auth.uid() = player_id);

-- Users can delete their own skill levels
CREATE POLICY "Users can delete their own skill levels"
  ON player_skill_levels FOR DELETE
  USING (auth.uid() = player_id);

-- ============================================================================
-- Game Events Policies
-- ============================================================================

-- Everyone can view game events (public broadcasts)
CREATE POLICY "Game events are viewable by everyone"
  ON game_events FOR SELECT
  USING (true);

-- Authenticated users can create game events
CREATE POLICY "Users can create game events"
  ON game_events FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own game events
CREATE POLICY "Creators can update their own game events"
  ON game_events FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own game events
CREATE POLICY "Creators can delete their own game events"
  ON game_events FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================================================
-- Game Participants Policies
-- ============================================================================

-- Everyone can view participants (to see player counts)
CREATE POLICY "Game participants are viewable by everyone"
  ON game_participants FOR SELECT
  USING (true);

-- Users can join games (insert themselves as participants)
CREATE POLICY "Users can join games"
  ON game_participants FOR INSERT
  WITH CHECK (
    auth.uid() = player_id AND
    -- Ensure game exists and is not full
    EXISTS (
      SELECT 1 FROM game_events ge
      WHERE ge.id = game_id
      AND ge.status IN ('waiting', 'confirmed')
      AND (
        SELECT COUNT(*) 
        FROM game_participants gp 
        WHERE gp.game_id = ge.id
      ) < ge.max_players
    )
  );

-- Users can leave games they've joined
CREATE POLICY "Users can leave games they joined"
  ON game_participants FOR DELETE
  USING (auth.uid() = player_id);

-- ============================================================================
-- PART 6: Helper Functions
-- ============================================================================

-- Function to get current participant count for a game
CREATE OR REPLACE FUNCTION get_game_participant_count(game_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM game_participants
  WHERE game_id = game_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user meets skill requirements for a game
CREATE OR REPLACE FUNCTION check_skill_requirement(
  user_uuid UUID,
  sport_int INT,
  min_skill skill_level_type,
  max_skill skill_level_type
)
RETURNS BOOLEAN AS $$
DECLARE
  user_skill skill_level_type;
  skill_order TEXT[] := ARRAY['never_played', 'beginner', 'average', 'pro', 'expert'];
  user_skill_idx INT;
  min_skill_idx INT;
  max_skill_idx INT;
BEGIN
  -- If no skill restriction, allow all
  IF min_skill IS NULL AND max_skill IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Get user's skill level for this sport
  SELECT skill_level INTO user_skill
  FROM player_skill_levels
  WHERE player_id = user_uuid AND sport_id = sport_int;

  -- If user hasn't evaluated this sport, deny access
  IF user_skill IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get skill level indexes
  user_skill_idx := array_position(skill_order, user_skill::TEXT);
  min_skill_idx := array_position(skill_order, min_skill::TEXT);
  max_skill_idx := array_position(skill_order, max_skill::TEXT);

  -- Check if user skill is within range
  RETURN user_skill_idx >= min_skill_idx AND user_skill_idx <= max_skill_idx;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to automatically update game status based on participant count
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
$$ LANGUAGE plpgsql;

-- Trigger to automatically update game status when participants join/leave
CREATE TRIGGER trigger_update_game_status_on_join
  AFTER INSERT ON game_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_game_status_on_participant_change();

CREATE TRIGGER trigger_update_game_status_on_leave
  AFTER DELETE ON game_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_game_status_on_participant_change();

-- ============================================================================
-- PART 7: Views for Common Queries
-- ============================================================================

-- View: Games with participant counts
CREATE OR REPLACE VIEW game_events_with_counts AS
SELECT 
  ge.*,
  COUNT(gp.id)::INT AS current_players,
  ARRAY_AGG(gp.player_id) FILTER (WHERE gp.player_id IS NOT NULL) AS participant_ids
FROM game_events ge
LEFT JOIN game_participants gp ON gp.game_id = ge.id
GROUP BY ge.id;

-- View: User's games (for My Games screen)
CREATE OR REPLACE VIEW user_games AS
SELECT 
  ge.*,
  gp.player_id AS user_id,
  gp.joined_at,
  COUNT(gp2.id)::INT AS current_players,
  CASE 
    WHEN COUNT(gp2.id) >= ge.min_players THEN 'confirmed'
    ELSE 'waiting'
  END AS display_status
FROM game_participants gp
JOIN game_events ge ON ge.id = gp.game_id
LEFT JOIN game_participants gp2 ON gp2.game_id = ge.id
GROUP BY ge.id, gp.player_id, gp.joined_at;

-- ============================================================================
-- PART 8: Grant Permissions
-- ============================================================================

-- Grant usage on enums to authenticated users
GRANT USAGE ON TYPE skill_level_type TO authenticated;
GRANT USAGE ON TYPE time_type TO authenticated;
GRANT USAGE ON TYPE game_status TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_game_participant_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_skill_requirement(UUID, INT, skill_level_type, skill_level_type) TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Add migration record comment
COMMENT ON TABLE player_skill_levels IS 'Stores user self-evaluated skill levels per sport (Migration 005)';
COMMENT ON TABLE game_events IS 'Game broadcasts posted by users (Migration 005)';
COMMENT ON TABLE game_participants IS 'Players who have joined game events (Migration 005)';

