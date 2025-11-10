import { supabase } from './supabase';
import type { /*GameEvent,*/ GameEventWithDetails, Sport, /*Profile*/ } from '../types';

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

