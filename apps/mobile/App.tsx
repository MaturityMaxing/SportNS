import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { UsernameScreen, OnboardingScreen, HomeScreen } from './src/screens';
import { LoadingScreen } from './src/components';
import { onAuthStateChange, getProfile } from './src/services/auth';
import { Colors } from './src/theme';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from './src/types';

/**
 * SportNS - Community Sports Platform
 * V2: Username-based auth with skill evaluation onboarding
 * 
 * Auth Flow:
 * 1. No session → UsernameScreen
 * 2. Session but no profile/username → UsernameScreen
 * 3. Session + profile but onboarding_completed = false → OnboardingScreen
 * 4. Session + profile + onboarding_completed = true → HomeScreen
 */

type AppState = 
  | { state: 'loading' }
  | { state: 'username' }
  | { state: 'onboarding'; profile: Profile }
  | { state: 'home'; profile: Profile };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [appState, setAppState] = useState<AppState>({ state: 'loading' });
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        // User is authenticated, check profile and onboarding status
        await checkProfileAndOnboarding(session.user.id);
      } else {
        // No session, show username screen
        setAppState({ state: 'username' });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkProfileAndOnboarding = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      
      if (!profile || !profile.username) {
        // No profile or username, show username screen
        setAppState({ state: 'username' });
        return;
      }

      if (!profile.onboarding_completed) {
        // Profile exists but onboarding not completed
        setAppState({ state: 'onboarding', profile });
        return;
      }

      // Profile complete, show home
      setAppState({ state: 'home', profile });
    } catch (error) {
      console.error('Error checking profile:', error);
      // On error, default to username screen
      setAppState({ state: 'username' });
    }
  };

  const handleUsernameSuccess = async (profile: Profile, isNewUser: boolean) => {
    console.log('Username auth success:', profile.username, isNewUser);
    
    if (isNewUser || !profile.onboarding_completed) {
      // New user or returning user who hasn't completed onboarding
      setAppState({ state: 'onboarding', profile });
    } else {
      // Returning user with completed onboarding
      setAppState({ state: 'home', profile });
    }
  };

  const handleOnboardingComplete = async () => {
    console.log('Onboarding completed');
    
    // Refresh profile to get updated onboarding status
    if (session?.user) {
      await checkProfileAndOnboarding(session.user.id);
    }
  };

  // Show loading screen while fonts are loading or app is initializing
  if (!fontsLoaded || appState.state === 'loading') {
    return (
      <SafeAreaProvider>
        <LoadingScreen message="Loading SportNS..." />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // Render appropriate screen based on app state
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          {appState.state === 'username' && (
            <UsernameScreen onSuccess={handleUsernameSuccess} />
          )}
          
          {appState.state === 'onboarding' && (
            <OnboardingScreen
              userId={appState.profile.id}
              username={appState.profile.username || 'User'}
              onComplete={handleOnboardingComplete}
            />
          )}
          
          {appState.state === 'home' && (
            <HomeScreen />
          )}
          
          <StatusBar style="auto" />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
