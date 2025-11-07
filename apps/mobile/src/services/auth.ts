import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, PlayerSkillLevel, SkillLevel } from '../types';

// Required for web browser to close properly after authentication
WebBrowser.maybeCompleteAuthSession();

/**
 * Auth service for username-based authentication and user management
 * V2: Simplified auth flow (Discord OAuth preserved but inactive)
 */

/**
 * Sign in with Discord using Supabase OAuth
 * Opens Discord OAuth in a web browser and handles the callback
 */
export const signInWithDiscord = async () => {
  try {
    // Create redirect URI for OAuth callback
    const redirectUri = makeRedirectUri({
      scheme: 'sportns',
      path: 'auth/callback',
    });

    console.log('Redirect URI:', redirectUri);

    // Start Supabase Discord OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;

    if (!data?.url) {
      throw new Error('No OAuth URL returned from Supabase');
    }

    // Log the OAuth URL for debugging
    console.log('OAuth URL:', data.url);

    // Open OAuth URL in browser
    // preferEphemeralSession: false allows using the Discord app if logged in
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
      {
        preferEphemeralSession: false,
        showInRecents: true,
      }
    );

    console.log('WebBrowser result:', JSON.stringify(result, null, 2));

    if (result.type === 'success') {
      const { url } = result;
      console.log('Callback URL received:', url);
      
      // Extract tokens from URL hash
      // eslint-disable-next-line no-undef
      const hashParams = new URL(url).hash.substring(1);
      // eslint-disable-next-line no-undef
      const params = new URLSearchParams(hashParams);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (!accessToken || !refreshToken) {
        console.error('Token extraction failed. Hash params:', hashParams);
        throw new Error('No tokens found in OAuth callback');
      }
      
      console.log('Successfully extracted tokens');

      // Set the session with the tokens
      const { data: sessionData, error: sessionError } = 
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError) throw sessionError;

      // After successful auth, create or update the profile
      if (sessionData.session) {
        await createOrUpdateProfile(sessionData.session.user);
      }

      return sessionData.session;
    } else if (result.type === 'cancel') {
      throw new Error('User cancelled the authentication');
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Discord OAuth error:', error);
    throw error;
  }
};

/**
 * Create or update user profile with Discord data
 */
const createOrUpdateProfile = async (user: User) => {
  try {
    const discordData = user.user_metadata;
    
    console.log('Creating profile for user:', user.id);
    console.log('Discord metadata:', JSON.stringify(discordData, null, 2));

    const profileData = {
      id: user.id,
      discord_id: discordData.provider_id || discordData.sub,
      discord_username: discordData.custom_claims?.global_name || 
                       discordData.full_name || 
                       discordData.name || 
                       'Discord User',
      discord_avatar_url: discordData.avatar_url || discordData.picture,
      updated_at: new Date().toISOString(),
    };

    console.log('Profile data to upsert:', JSON.stringify(profileData, null, 2));

    // Upsert profile (insert or update)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Profile upsert error:', error);
      throw error;
    }
    
    console.log('Profile created/updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Get user profile from the profiles table
 */
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // If profile doesn't exist (PGRST116), return null instead of throwing
  if (error) {
    if (error.code === 'PGRST116') {
      console.warn('Profile not found for user:', userId);
      return null;
    }
    throw error;
  }
  return data;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================================================
// V2: Username-Based Authentication (New)
// ============================================================================

/**
 * Sign in or create account with username
 * Uses email/password auth with generated email from username
 * Email format: username@sportns.local (internal use only)
 * Password: Consistent hash based on username for automatic sign-in
 */
export const signInWithUsername = async (username: string): Promise<{ session: Session; profile: Profile; isNewUser: boolean }> => {
  try {
    // Validate username
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }

    const trimmedUsername = username.trim().toLowerCase();
    
    // Generate email and password from username
    // Email: username@sportns.local (internal domain)
    // Password: Simple consistent password (in production, use proper hashing)
    const email = `${trimmedUsername}@sportns.local`;
    const password = `${trimmedUsername}_sportns_2024`; // Consistent password for auto-login

    // Check if username is already taken
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If username exists, sign in as that user
    if (existingProfile) {
      console.log('Existing user found, signing in:', trimmedUsername);
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('Sign-in error:', signInError);
        throw new Error('Failed to sign in. Please check your username.');
      }
      
      if (!authData.session) throw new Error('No session returned');

      // Get the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', trimmedUsername)
        .single();

      if (profileError) throw profileError;

      return { 
        session: authData.session, 
        profile: profile as Profile,
        isNewUser: false 
      };
    }

    // Create new user with email/password auth
    console.log('Creating new user:', trimmedUsername);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
        },
        emailRedirectTo: undefined, // No email confirmation needed
      },
    });

    if (authError) {
      console.error('Sign-up error:', authError);
      throw authError;
    }
    
    if (!authData.user || !authData.session) {
      throw new Error('No user or session returned from sign-up');
    }

    // Create profile with username
    const profileData = {
      id: authData.user.id,
      username: trimmedUsername,
      onboarding_completed: false,
      discord_id: null,
      discord_username: null,
      discord_avatar_url: null,
      expo_push_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, clean up the auth user
      await supabase.auth.signOut();
      throw profileError;
    }

    console.log('New user created successfully:', trimmedUsername);

    return { 
      session: authData.session, 
      profile: profile as Profile,
      isNewUser: true 
    };
  } catch (error) {
    console.error('Username auth error:', error);
    throw error;
  }
};

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !data; // Available if no data found
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

/**
 * Update username for current user
 */
export const updateUsername = async (userId: string, newUsername: string): Promise<Profile> => {
  try {
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      throw new Error('Username cannot be empty');
    }

    // Check if username is taken by another user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .neq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      throw new Error('Username is already taken');
    }

    // Update username
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        username: trimmedUsername,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data as Profile;
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

/**
 * Complete onboarding (set onboarding_completed flag)
 */
export const completeOnboarding = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

// ============================================================================
// Skill Level Management
// ============================================================================

/**
 * Save or update player skill levels
 */
export const saveSkillLevels = async (
  playerId: string,
  skills: Array<{ sport_id: number; skill_level: SkillLevel }>
): Promise<void> => {
  try {
    if (skills.length === 0) {
      throw new Error('At least one skill level is required');
    }

    // Upsert skill levels
    const skillData = skills.map(skill => ({
      player_id: playerId,
      sport_id: skill.sport_id,
      skill_level: skill.skill_level,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('player_skill_levels')
      .upsert(skillData, { 
        onConflict: 'player_id,sport_id',
        ignoreDuplicates: false 
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving skill levels:', error);
    throw error;
  }
};

/**
 * Get player skill levels
 */
export const getSkillLevels = async (playerId: string): Promise<PlayerSkillLevel[]> => {
  try {
    const { data, error } = await supabase
      .from('player_skill_levels')
      .select('*')
      .eq('player_id', playerId);

    if (error) throw error;

    return data as PlayerSkillLevel[];
  } catch (error) {
    console.error('Error fetching skill levels:', error);
    throw error;
  }
};

/**
 * Get all sports
 */
export const getSports = async () => {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .order('id');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching sports:', error);
    throw error;
  }
};

