import { supabase } from './supabase';

/**
 * Auth service for Discord OAuth and user management
 * Will be implemented on Day 2
 */

export const signInWithDiscord = async () => {
  // TODO: Implement Discord OAuth flow
  throw new Error('Not yet implemented');
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

