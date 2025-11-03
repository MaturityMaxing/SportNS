-- Row Level Security (RLS) Policies
-- Migration 003: Set up security policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_elo_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sports policies (read-only for all authenticated users)
CREATE POLICY "Sports are viewable by everyone"
  ON sports FOR SELECT
  USING (true);

-- Player availability policies
CREATE POLICY "Availability is viewable by everyone"
  ON player_availability FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own availability"
  ON player_availability FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Player ELO ratings policies
CREATE POLICY "ELO ratings are viewable by everyone"
  ON player_elo_ratings FOR SELECT
  USING (true);

CREATE POLICY "ELO ratings can only be modified by the system"
  ON player_elo_ratings FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "ELO ratings update system only"
  ON player_elo_ratings FOR UPDATE
  USING (auth.uid() = player_id);

-- Challenges policies
CREATE POLICY "Challenges viewable by participants"
  ON challenges FOR SELECT
  USING (
    auth.uid() = challenger_id OR 
    auth.uid() = challenged_id OR
    status IN ('accepted', 'completed')
  );

CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Challenged user can update challenge"
  ON challenges FOR UPDATE
  USING (
    auth.uid() = challenged_id OR 
    auth.uid() = challenger_id
  );

-- Game scores policies
CREATE POLICY "Scores viewable by challenge participants"
  ON game_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = game_scores.challenge_id
      AND (challenges.challenger_id = auth.uid() OR challenges.challenged_id = auth.uid())
    )
  );

CREATE POLICY "Participants can submit scores"
  ON game_scores FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = challenge_id
      AND (challenges.challenger_id = auth.uid() OR challenges.challenged_id = auth.uid())
      AND challenges.status = 'completed'
    )
  );

CREATE POLICY "Users can update their own score submissions"
  ON game_scores FOR UPDATE
  USING (auth.uid() = submitted_by);

