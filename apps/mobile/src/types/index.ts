// Shared TypeScript types for the SportNS mobile app

export type Sport = {
  id: number;
  name: string;
  slug: string;
};

export type Profile = {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar_url: string;
  expo_push_token: string | null;
  created_at: string;
};

export type PlayerAvailability = {
  id: string;
  player_id: string;
  sport_id: number;
  is_available: boolean;
  updated_at: string;
};

export type PlayerEloRating = {
  id: string;
  player_id: string;
  sport_id: number;
  elo_rating: number;
  games_played: number;
  wins: number;
  losses: number;
};

export type ChallengeStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export type Challenge = {
  id: string;
  sport_id: number;
  challenger_id: string;
  challenged_id: string;
  status: ChallengeStatus;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
};

export type GameScore = {
  id: string;
  challenge_id: string;
  submitted_by: string;
  challenger_score: number;
  challenged_score: number;
  submitted_at: string;
  confirmed: boolean;
};

// Extended types with joined data
export type PlayerWithAvailability = Profile & {
  availability?: PlayerAvailability;
};

export type PlayerWithElo = Profile & {
  elo?: PlayerEloRating;
};

export type ChallengeWithDetails = Challenge & {
  sport?: Sport;
  challenger?: Profile;
  challenged?: Profile;
  scores?: GameScore[];
};

