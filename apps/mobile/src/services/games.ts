import { supabase } from './supabase';
import type { GameEventWithDetails, Sport, SkillLevel, TimeType, GameChatMessageWithSender } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Game Events Service
 * Handles CRUD operations for game events and participants
 */

/**
 * Get all sports
 */
export const getSports = async (): Promise<Sport[]> => {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching sports:', error);
    throw error;
  }
};

/**
 * Get all active game events (waiting or confirmed)
 * Optionally filter by sport
 */
export const getActiveGames = async (sportId?: number): Promise<GameEventWithDetails[]> => {
  try {
    let query = supabase
      .from('game_events')
      .select(`
        *,
        sport:sports(id, name, slug, icon),
        creator:profiles!creator_id(id, username, discord_username, discord_avatar_url)
      `)
      .in('status', ['waiting', 'confirmed'])
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true });

    if (sportId) {
      query = query.eq('sport_id', sportId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get participant counts for each game
    const gamesWithDetails = await Promise.all(
      (data || []).map(async (game) => {
        const { data: participants, error: participantError } = await supabase
          .from('game_participants')
          .select('player_id, profiles!player_id(id, username, discord_username, discord_avatar_url)')
          .eq('game_id', game.id);

        if (participantError) {
          console.error('Error fetching participants:', participantError);
        }

        return {
          ...game,
          sport: Array.isArray(game.sport) ? game.sport[0] : game.sport,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          current_players: participants?.length || 0,
          participants: participants?.map(p => p.profiles).filter(Boolean) || [],
        } as GameEventWithDetails;
      })
    );

    return gamesWithDetails;
  } catch (error) {
    console.error('Error fetching active games:', error);
    throw error;
  }
};

/**
 * Get game event by ID with full details
 */
export const getGameById = async (gameId: string): Promise<GameEventWithDetails | null> => {
  try {
    const { data: game, error: gameError } = await supabase
      .from('game_events')
      .select(`
        *,
        sport:sports(id, name, slug, icon),
        creator:profiles!creator_id(id, username, discord_username, discord_avatar_url)
      `)
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    // Get participants
    const { data: participants, error: participantError } = await supabase
      .from('game_participants')
      .select('player_id, profiles!player_id(id, username, discord_username, discord_avatar_url)')
      .eq('game_id', gameId);

    if (participantError) {
      console.error('Error fetching participants:', participantError);
    }

    return {
      ...game,
      sport: Array.isArray(game.sport) ? game.sport[0] : game.sport,
      creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
      current_players: participants?.length || 0,
      participants: participants?.map(p => p.profiles).filter(Boolean) || [],
    } as GameEventWithDetails;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
};

/**
 * Join a game event
 */
export const joinGame = async (gameId: string, playerId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('game_participants')
      .insert({
        game_id: gameId,
        player_id: playerId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

/**
 * Leave a game event
 */
export const leaveGame = async (gameId: string, playerId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('game_participants')
      .delete()
      .eq('game_id', gameId)
      .eq('player_id', playerId);

    if (error) throw error;
  } catch (error) {
    console.error('Error leaving game:', error);
    throw error;
  }
};

/**
 * Check if a user has joined a game
 */
export const hasJoinedGame = async (gameId: string, playerId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('game_participants')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Error checking game participation:', error);
    return false;
  }
};

/**
 * Get games that the user has joined
 * Only returns active games (waiting or confirmed status)
 */
export const getUserGames = async (userId: string): Promise<GameEventWithDetails[]> => {
  try {
    const { data: participations, error: participationError } = await supabase
      .from('game_participants')
      .select('game_id')
      .eq('player_id', userId);

    if (participationError) throw participationError;

    if (!participations || participations.length === 0) {
      return [];
    }

    const gameIds = participations.map(p => p.game_id);

    const { data, error } = await supabase
      .from('game_events')
      .select(`
        *,
        sport:sports(id, name, slug, icon),
        creator:profiles!creator_id(id, username, discord_username, discord_avatar_url)
      `)
      .in('id', gameIds)
      .in('status', ['waiting', 'confirmed']) // Filter out completed and cancelled games
      .order('scheduled_time', { ascending: true });

    if (error) throw error;

    // Get participant counts for each game
    const gamesWithDetails = await Promise.all(
      (data || []).map(async (game) => {
        const { data: participants, error: participantError } = await supabase
          .from('game_participants')
          .select('player_id, profiles!player_id(id, username, discord_username, discord_avatar_url)')
          .eq('game_id', game.id);

        if (participantError) {
          console.error('Error fetching participants:', participantError);
        }

        return {
          ...game,
          sport: Array.isArray(game.sport) ? game.sport[0] : game.sport,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          current_players: participants?.length || 0,
          participants: participants?.map(p => p.profiles).filter(Boolean) || [],
          is_joined: true,
        } as GameEventWithDetails;
      })
    );

    return gamesWithDetails;
  } catch (error) {
    console.error('Error fetching user games:', error);
    throw error;
  }
};

/**
 * Create a new game event
 * Automatically joins the creator as the first participant
 */
export interface CreateGameEventParams {
  sport_id: number;
  creator_id: string;
  min_players: number;
  max_players: number;
  skill_level_min: SkillLevel | null;
  skill_level_max: SkillLevel | null;
  scheduled_time: Date;
  time_type: TimeType;
  time_label: string | null;
}

export const createGameEvent = async (params: CreateGameEventParams): Promise<string> => {
  try {
    // 1. Insert game event
    const { data: gameData, error: gameError } = await supabase
      .from('game_events')
      .insert({
        sport_id: params.sport_id,
        creator_id: params.creator_id,
        min_players: params.min_players,
        max_players: params.max_players,
        skill_level_min: params.skill_level_min,
        skill_level_max: params.skill_level_max,
        scheduled_time: params.scheduled_time.toISOString(),
        time_type: params.time_type,
        time_label: params.time_label,
        status: 'waiting',
      })
      .select('id')
      .single();

    if (gameError) throw gameError;
    if (!gameData) throw new Error('Failed to create game event');

    const gameId = gameData.id;

    // 2. Auto-join creator as first participant
    const { error: participantError } = await supabase
      .from('game_participants')
      .insert({
        game_id: gameId,
        player_id: params.creator_id,
      });

    if (participantError) {
      console.error('Error auto-joining creator:', participantError);
      // Don't throw - game was created successfully
    }

    return gameId;
  } catch (error) {
    console.error('Error creating game event:', error);
    throw error;
  }
};

/**
 * Get user's game posting history
 * Returns last N games created by the user for quick re-posting
 */
export const getUserGameHistory = async (userId: string, limit: number = 5): Promise<GameEventWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('game_events')
      .select(`
        *,
        sport:sports(id, name, slug, icon),
        creator:profiles!creator_id(id, username, discord_username, discord_avatar_url)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get participant counts for each game
    const gamesWithDetails = await Promise.all(
      (data || []).map(async (game) => {
        const { data: participants, error: participantError } = await supabase
          .from('game_participants')
          .select('player_id, profiles!player_id(id, username, discord_username, discord_avatar_url)')
          .eq('game_id', game.id);

        if (participantError) {
          console.error('Error fetching participants:', participantError);
        }

        return {
          ...game,
          sport: Array.isArray(game.sport) ? game.sport[0] : game.sport,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          current_players: participants?.length || 0,
          participants: participants?.map(p => p.profiles).filter(Boolean) || [],
        } as GameEventWithDetails;
      })
    );

    return gamesWithDetails;
  } catch (error) {
    console.error('Error fetching user game history:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for game events
 * Returns a channel that can be unsubscribed
 */
export const subscribeToGameUpdates = (
  onGameChange: () => void
): RealtimeChannel => {
  // Generate unique channel name to avoid conflicts between screens
  const channelName = `game-events-changes-${Math.random().toString(36).substring(7)}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'game_events',
      },
      (payload) => {
        console.log('Game event changed:', payload.eventType);
        onGameChange();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'game_participants',
      },
      (payload) => {
        console.log('Game participant changed:', payload.eventType);
        onGameChange();
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  return channel;
};

/**
 * Unsubscribe from game updates
 */
export const unsubscribeFromGameUpdates = async (channel: RealtimeChannel): Promise<void> => {
  await supabase.removeChannel(channel);
};

/**
 * End a game (set status to completed)
 * Can be called by any participant
 */
export const endGame = async (gameId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('game_events')
      .update({ status: 'completed' })
      .eq('id', gameId);

    if (error) throw error;
  } catch (error) {
    console.error('Error ending game:', error);
    throw error;
  }
};

/**
 * Generate shareable text for a game
 */
export const generateShareText = (game: GameEventWithDetails): string => {
  const sportName = game.sport?.name || 'Sport';
  const sportIcon = game.sport?.icon || '🏃';
  const timeString = new Date(game.scheduled_time).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  let shareText = `${sportIcon} ${sportName} Game\n`;
  shareText += `📅 ${timeString}\n`;
  shareText += `👥 ${game.current_players}/${game.max_players} players`;
  
  if (game.min_players > 0) {
    shareText += ` (min ${game.min_players})`;
  }
  
  if (game.skill_level_min || game.skill_level_max) {
    shareText += `\n📊 Skill: ${game.skill_level_min || 'Any'} to ${game.skill_level_max || 'Any'}`;
  }
  
  shareText += `\n\nJoin via NS Sports app!`;
  
  return shareText;
};

/**
 * Get chat messages for a game
 */
export const getGameChatMessages = async (gameId: string): Promise<GameChatMessageWithSender[]> => {
  try {
    const { data, error } = await supabase
      .from('game_chat_messages')
      .select(`
        *,
        sender:profiles!sender_id(id, username, discord_username, discord_avatar_url)
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(msg => {
      const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
      return {
        ...msg,
        sender,
        sender_username: sender?.username || sender?.discord_username || 'Unknown',
      } as GameChatMessageWithSender;
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

/**
 * Send a chat message to a game
 */
export const sendChatMessage = async (gameId: string, senderId: string, message: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('game_chat_messages')
      .insert({
        game_id: gameId,
        sender_id: senderId,
        message: message.trim(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time chat messages for a game
 */
export const subscribeToChatMessages = (
  gameId: string,
  onNewMessage: (message: GameChatMessageWithSender) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`game-chat-${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'game_chat_messages',
        filter: `game_id=eq.${gameId}`,
      },
      async (payload) => {
        console.log('New chat message:', payload);
        
        // Fetch the sender info
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, username, discord_username, discord_avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        const message: GameChatMessageWithSender = {
          ...payload.new as any,
          sender,
          sender_username: sender?.username || sender?.discord_username || 'Unknown',
        };

        onNewMessage(message);
      }
    )
    .subscribe();

  return channel;
};

/**
 * Subscribe to real-time participant updates for a game
 */
export const subscribeToParticipantUpdates = (
  gameId: string,
  onUpdate: () => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`game-participants-${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_participants',
        filter: `game_id=eq.${gameId}`,
      },
      () => {
        console.log('Participant list changed');
        onUpdate();
      }
    )
    .subscribe();

  return channel;
};

/**
 * User Statistics Interface
 */
export interface UserStats {
  totalGames: number;
  completedGames: number;
  activeGames: number;
  gamesCreated: number;
}

/**
 * Get comprehensive user statistics
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Get all games the user has participated in
    const { data: allParticipations, error: participationError } = await supabase
      .from('game_participants')
      .select('game_id, game_events!inner(status)')
      .eq('player_id', userId);

    if (participationError) throw participationError;

    // Count different game types
    const totalGames = allParticipations?.length || 0;
    const completedGames = allParticipations?.filter(
      (p: any) => p.game_events?.status === 'completed'
    ).length || 0;
    const activeGames = allParticipations?.filter(
      (p: any) => p.game_events?.status === 'waiting' || p.game_events?.status === 'confirmed'
    ).length || 0;

    // Get games created by user
    const { data: createdGames, error: createdError } = await supabase
      .from('game_events')
      .select('id')
      .eq('creator_id', userId);

    if (createdError) throw createdError;

    const gamesCreated = createdGames?.length || 0;

    return {
      totalGames,
      completedGames,
      activeGames,
      gamesCreated,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return zeros on error instead of throwing
    return {
      totalGames: 0,
      completedGames: 0,
      activeGames: 0,
      gamesCreated: 0,
    };
  }
};

