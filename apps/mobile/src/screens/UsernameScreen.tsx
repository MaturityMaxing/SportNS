import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SportIcon } from '../components';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { signInWithUsername } from '../services/auth';
import type { Profile } from '../types';

interface UsernameScreenProps {
  onSuccess: (profile: Profile, isNewUser: boolean) => void;
}

export const UsernameScreen: React.FC<UsernameScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Clear previous error
    setError('');

    // Validate username
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    // Only allow alphanumeric characters, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setLoading(true);

    try {
      const { profile, isNewUser } = await signInWithUsername(trimmedUsername);
      console.log('Auth successful:', profile.username, isNewUser ? '(new)' : '(existing)');
      onSuccess(profile, isNewUser);
    } catch (err) {
      console.error('Username auth failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.appIconContainer}>
              <SportIcon sport={{ slug: 'basketball' }} size={64} />
            </View>
            <Text style={styles.appName}>NS Sports</Text>
            <Text style={styles.tagline}>Connect. Play. Compete.</Text>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.welcomeText}>
              Enter your username to get started. You'll be able to post games, join events, and connect with players in your community.
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError(''); // Clear error on input change
              }}
              placeholder="Enter your username"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!loading}
              maxLength={20}
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.helperText}>
                3-20 characters, letters, numbers, _ and - only
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title={loading ? 'Signing In...' : 'Continue'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !username.trim()}
            fullWidth
            size="large"
            style={styles.submitButton}
          />

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              • New users will be taken through a quick skill evaluation
            </Text>
            <Text style={styles.infoText}>
              • Returning users will be signed in automatically
            </Text>
            <Text style={styles.infoText}>
              • You can change your username anytime in settings
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  appIconContainer: {
    marginBottom: Spacing.md,
  },
  appName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: Spacing.xxxl,
  },
  welcomeTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  welcomeText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },

  // Input Section
  inputSection: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 56,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  helperText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },

  // Submit Button
  submitButton: {
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },

  // Info Section
  infoSection: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
});

