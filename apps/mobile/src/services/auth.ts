import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import type { User, Session } from '@supabase/supabase-js';

// Required for web browser to close properly after authentication
WebBrowser.maybeCompleteAuthSession();

/**
 * Auth service for Discord OAuth and user management
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

