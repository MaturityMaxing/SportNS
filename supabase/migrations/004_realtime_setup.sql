-- Realtime Configuration
-- Migration 004: Enable realtime for specific tables

-- Enable realtime on player_availability for live status updates
ALTER PUBLICATION supabase_realtime ADD TABLE player_availability;

-- Enable realtime on challenges for live challenge updates
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;

-- Enable realtime on player_elo_ratings for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE player_elo_ratings;

-- Enable realtime on game_scores for score submission updates
ALTER PUBLICATION supabase_realtime ADD TABLE game_scores;

