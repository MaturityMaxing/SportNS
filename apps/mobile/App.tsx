import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen, HomeScreen } from './src/screens';
import { LoadingScreen } from './src/components';
import { onAuthStateChange } from './src/services/auth';
import { Colors } from './src/theme';
import type { Session } from '@supabase/supabase-js';

/**
 * SportNS - Community Sports Platform
 * Day 3: Navigation & UI Foundation Implemented
 * 
 * Features:
 * - Discord OAuth login
 * - Session management
 * - Bottom tab navigation (Free Play, Leaderboards, Profile)
 * - Theme system with consistent styling
 * - Shared UI components
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setSession(session);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen message="Loading SportNS..." />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // Show appropriate screen based on auth state
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          {session ? <HomeScreen /> : <LoginScreen />}
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
