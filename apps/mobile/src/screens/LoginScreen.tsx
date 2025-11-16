import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithDiscord } from '../services/auth';

/**
 * LoginScreen - Discord OAuth authentication
 */
export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithDiscord();
      // Navigation will be handled by auth state change in App.tsx
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Authentication Error',
        error instanceof Error ? error.message : 'Failed to sign in with Discord. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏀</Text>
        <Text style={styles.title}>SportNS</Text>
        <Text style={styles.subtitle}>Community Sports Platform</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Connect with local players, track your availability, and compete
          across 9 different sports with our ELO ranking system.
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="⚡" text="Real-time availability tracking" />
          <FeatureItem icon="🏆" text="Competitive ELO rankings" />
          <FeatureItem icon="⚽" text="Challenge other players" />
          <FeatureItem icon="📊" text="Track your performance" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.discordButton, isLoading && styles.buttonDisabled]}
          onPress={handleDiscordLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.discordIcon}>💬</Text>
              <Text style={styles.buttonText}>Sign in with Discord</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#5865F2',
  },
  logo: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  footer: {
    padding: 24,
  },
  discordButton: {
    backgroundColor: '#5865F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  discordIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

