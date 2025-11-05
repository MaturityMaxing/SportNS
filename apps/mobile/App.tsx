import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { LoginScreen, ProfileScreen } from './src/screens';
import { onAuthStateChange } from './src/services/auth';
import type { Session } from '@supabase/supabase-js';

/**
 * SportNS - Community Sports Platform
 * Day 2: Discord OAuth Authentication Implemented
 * 
 * Features:
 * - Discord OAuth login
 * - Session management
 * - Profile display
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
        <StatusBar style="auto" />
      </View>
    );
  }

  // Show appropriate screen based on auth state
  return (
    <View style={styles.container}>
      {session ? <ProfileScreen /> : <LoginScreen />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
