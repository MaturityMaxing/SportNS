// Shared TypeScript types for the SportNS mobile app

// ============================================================================
// Core Types
// ============================================================================

export type Sport = {
  id: number;
  name: string;
  slug: string;
  icon?: string;
};

// ============================================================================
// Skill Level Types (New in V2)
// ============================================================================

export type SkillLevel = 
  | 'never_played'
  | 'beginner'
  | 'average'
  | 'pro'
  | 'expert';

export const SKILL_LEVELS: SkillLevel[] = [
  'never_played',
  'beginner',
  'average',
  'pro',
  'expert',
];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  never_played: 'Never Played',
  beginner: 'Beginner',
  average: 'Average',
  pro: 'Pro',
  expert: 'Expert',
};

export const SKILL_LEVEL_DESCRIPTIONS: Record<SkillLevel, string> = {
  never_played: 'No experience',
  beginner: 'Just starting out',
  average: 'Comfortable playing',
  pro: 'Very skilled',
  expert: 'Top-tier player',
};

// ============================================================================
// Profile Types (Updated in V2)
// ============================================================================

export type Profile = {
  id: string;
  discord_id?: string | null;
  discord_username?: string | null;
  discord_avatar_url?: string | null;
  username: string | null;
  onboarding_completed: boolean;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerSkillLevel = {
  id: string;
  player_id: string;
  sport_id: number;
  skill_level: SkillLevel;
  updated_at: string;
};

// ============================================================================
// Game Event Types (New in V2)
// ============================================================================

export type TimeType = 'now' | 'time_of_day' | 'precise';

export type GameStatus = 'waiting' | 'confirmed' | 'completed' | 'cancelled';

export type GameEvent = {
  id: string;
  sport_id: number;
  creator_id: string;
  min_players: number;
  max_players: number;
  skill_level_min: SkillLevel | null;
  skill_level_max: SkillLevel | null;
  scheduled_time: string;
  time_type: TimeType;
  time_label: string | null;
  status: GameStatus;
  created_at: string;
  updated_at: string;
};

export type GameParticipant = {
  id: string;
  game_id: string;
  player_id: string;
  joined_at: string;
};

export type GameChatMessage = {
  id: string;
  game_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export type GameChatMessageWithSender = GameChatMessage & {
  sender?: Profile;
  sender_username?: string;
};

// Extended game event type with additional data
export type GameEventWithDetails = GameEvent & {
  sport?: Sport;
  creator?: Profile;
  current_players?: number;
  participants?: Profile[];
  is_joined?: boolean;
};

// ============================================================================
// Legacy Types (Preserved for future competitive features)
// ============================================================================

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

// ============================================================================
// Extended Types with Joined Data
// ============================================================================

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

export type PlayerWithSkills = Profile & {
  skills?: PlayerSkillLevel[];
};

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationSettings = {
  id: string;
  user_id: string;
  notify_30min_before_game: boolean;
  notify_5min_before_game: boolean;
  notify_new_chat_message: boolean;
  notify_player_joins_game: boolean;
  created_at: string;
  updated_at: string;
};

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export type NotificationType = 
  | 'game_30min_reminder'
  | 'game_5min_reminder'
  | 'chat_message'
  | 'player_joined';

export type NotificationQueueItem = {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  game_id: string | null;
  title: string;
  body: string;
  data: Record<string, any> | null;
  scheduled_for: string;
  status: NotificationStatus;
  sent_at: string | null;
  created_at: string;
};

// ============================================================================
// UI Helper Types
// ============================================================================

export type SkillLevelSelection = {
  sport_id: number;
  skill_level: SkillLevel | null;
};

export type TimeOfDayOption = 
  | 'before_lunch'
  | 'after_lunch'
  | 'before_dinner'
  | 'after_dinner'
  | 'tomorrow_morning';

export const TIME_OF_DAY_OPTIONS: Record<TimeOfDayOption, { label: string; hour: number }> = {
  before_lunch: { label: 'Before Lunch', hour: 11 },
  after_lunch: { label: 'After Lunch', hour: 14 },
  before_dinner: { label: 'Before Dinner', hour: 17 },
  after_dinner: { label: 'After Dinner', hour: 20 },
  tomorrow_morning: { label: 'Tomorrow Morning', hour: 9 },
};

