import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ArrowLeft, BarChart3, Bell, ChevronRight } from 'lucide-react-native';
import { getCurrentUser, getProfile, signOut, updateUsername } from '../services/auth';
import type { Profile } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { Button, TopNav } from '../components';

/**
 * ProfileScreen - Display user profile and logout
 */
export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Username change states
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (user) {
        const profileData = await getProfile(user.id);
        setProfile(profileData);
        // Skills, sports, and stats are loaded on-demand when needed
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
              // Navigation will be handled by auth state change in App.tsx
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleChangeUsername = () => {
    setNewUsername(profile?.username || '');
    setShowUsernameModal(true);
  };

  const handleUpdateUsername = async () => {
    if (!profile) return;
    
    const trimmedUsername = newUsername.trim();
    
    if (!trimmedUsername) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (trimmedUsername === profile.username) {
      setShowUsernameModal(false);
      return;
    }

    setIsUpdatingUsername(true);
    try {
      const updatedProfile = await updateUsername(profile.id, trimmedUsername);
      setProfile(updatedProfile);
      setShowUsernameModal(false);
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update username');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleReEvaluateSkills = () => {
    navigation.navigate('ReEvaluateSkills' as never);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopNav
          title="Profile"
          centered
          leftAction={{
            icon: ArrowLeft,
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <TopNav
          title="Profile"
          centered
          leftAction={{
            icon: ArrowLeft,
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
          <Text style={styles.errorSubtext}>
            Your profile is being created. Please wait a moment.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadProfile}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav
        title="Profile"
        centered
        leftAction={{
          icon: ArrowLeft,
          onPress: () => navigation.goBack(),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.discord_avatar_url ? (
            <Image
              source={{ uri: profile.discord_avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {(profile.username || profile.discord_username)?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.username}>{profile.username || profile.discord_username}</Text>
        {profile.discord_username && profile.username && (
          <Text style={styles.userId}>@{profile.discord_username}</Text>
        )}
        <TouchableOpacity 
          onPress={handleChangeUsername}
          style={styles.changeUsernameButton}
          activeOpacity={0.6}
        >
          <Text style={styles.changeUsernameText}>Change username</Text>
        </TouchableOpacity>
      </View>

      {/* Re-evaluate Skills Button */}
      <View style={styles.primaryActionContainer}>
        <TouchableOpacity 
          style={styles.primaryActionButton}
          onPress={handleReEvaluateSkills}
          activeOpacity={0.85}
        >
          <View style={styles.primaryActionIconContainer}>
            <BarChart3 size={24} color={Colors.textInverse} strokeWidth={2} />
          </View>
          <View style={styles.primaryActionContent}>
            <Text style={styles.primaryActionTitle}>Re-evaluate Skills</Text>
            <Text style={styles.primaryActionSubtitle}>Update your skill levels</Text>
          </View>
          <View style={styles.primaryActionArrowContainer}>
            <ChevronRight size={20} color={Colors.textInverse} strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Notification Settings Button */}
      <View style={styles.notificationButtonContainer}>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('NotificationSettings' as never)}
          activeOpacity={0.7}
        >
          <Bell size={20} color={Colors.text} strokeWidth={2} />
          <Text style={styles.notificationButtonText}>Notification Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={[styles.signOutButton, isSigningOut && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Username Change Modal */}
      <Modal
        visible={showUsernameModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <Text style={styles.modalSubtitle}>Enter your new username</Text>
            
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="New username"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowUsernameModal(false)}
                variant="outline"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="Update"
                onPress={handleUpdateUsername}
                variant="primary"
                size="medium"
                loading={isUpdatingUsername}
                disabled={isUpdatingUsername}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: Colors.borderLight,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  username: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userId: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  changeUsernameButton: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  changeUsernameText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  // Primary Action Button (Re-evaluate Skills)
  primaryActionContainer: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  primaryActionIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  primaryActionSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  primaryActionArrowContainer: {
    width: 24,
    alignItems: 'center',
  },
  // Notification Settings Button
  notificationButtonContainer: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  notificationButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  notificationButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  signOutContainer: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  signOutButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.textInverse,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  errorSubtext: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.textInverse,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Username Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.medium,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

