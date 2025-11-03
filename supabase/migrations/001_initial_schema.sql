-- SportNS Database Schema
-- Migration 001: Initial Schema Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT NOT NULL,
  discord_avatar_url TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sports table (reference data)
CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player availability tracking
CREATE TABLE player_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, sport_id)
);

-- Player ELO ratings per sport
CREATE TABLE player_elo_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  elo_rating INT NOT NULL DEFAULT 1200,
  games_played INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, sport_id)
);

-- Challenge status enum
CREATE TYPE challenge_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'completed',
  'disputed',
  'cancelled'
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status challenge_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_players CHECK (challenger_id != challenged_id)
);

-- Game scores submissions
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenger_score INT NOT NULL CHECK (challenger_score >= 0),
  challenged_score INT NOT NULL CHECK (challenged_score >= 0),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_scores CHECK (challenger_score != challenged_score)
);

-- Indexes for performance
CREATE INDEX idx_player_availability_player ON player_availability(player_id);
CREATE INDEX idx_player_availability_sport ON player_availability(sport_id);
CREATE INDEX idx_player_availability_available ON player_availability(is_available) WHERE is_available = TRUE;

CREATE INDEX idx_player_elo_sport ON player_elo_ratings(sport_id);
CREATE INDEX idx_player_elo_rating ON player_elo_ratings(elo_rating DESC);

CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_sport ON challenges(sport_id);

CREATE INDEX idx_game_scores_challenge ON game_scores(challenge_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_availability_updated_at
  BEFORE UPDATE ON player_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_elo_ratings_updated_at
  BEFORE UPDATE ON player_elo_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

