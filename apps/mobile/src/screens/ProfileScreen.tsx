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
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { getCurrentUser, getProfile, signOut, updateUsername, getSkillLevels, saveSkillLevels, getSports } from '../services/auth';
import type { Profile, Sport, SkillLevel } from '../types';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_DESCRIPTIONS, SKILL_LEVELS } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { Button } from '../components';

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
  
  // Skill re-evaluation states
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [skillSelections, setSkillSelections] = useState<Record<number, SkillLevel | null>>({});
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false);

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

  const handleReEvaluateSkills = async () => {
    if (!profile) return;

    try {
      // Load sports and current skills
      const [sportsData, skillsData] = await Promise.all([
        getSports(),
        getSkillLevels(profile.id),
      ]);

      setSports(sportsData);

      // Initialize skill selections with current values
      const initialSelections: Record<number, SkillLevel | null> = {};
      sportsData.forEach((sport) => {
        const existingSkill = skillsData.find(s => s.sport_id === sport.id);
        initialSelections[sport.id] = existingSkill?.skill_level || null;
      });
      setSkillSelections(initialSelections);

      setShowSkillsModal(true);
    } catch (error) {
      console.error('Error loading skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    }
  };

  const handleSkillChange = (sportId: number, value: number) => {
    const skillLevel = SKILL_LEVELS[value];
    setSkillSelections((prev) => ({
      ...prev,
      [sportId]: skillLevel,
    }));
  };

  const getSliderValue = (sportId: number): number => {
    const skill = skillSelections[sportId];
    if (!skill) return -1;
    return SKILL_LEVELS.indexOf(skill);
  };

  const handleSaveSkills = async () => {
    if (!profile) return;

    const selectedSkills = Object.entries(skillSelections)
      .filter(([_, level]) => level !== null)
      .map(([sportId, level]) => ({
        sport_id: parseInt(sportId),
        skill_level: level as SkillLevel,
      }));

    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please evaluate at least one sport');
      return;
    }

    setIsUpdatingSkills(true);
    try {
      await saveSkillLevels(profile.id, selectedSkills);
      setShowSkillsModal(false);
      Alert.alert('Success', 'Skills updated successfully!');
    } catch (error) {
      console.error('Error updating skills:', error);
      Alert.alert('Error', 'Failed to update skills');
    } finally {
      setIsUpdatingSkills(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
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
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
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
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionIcon}>📊</Text>
          <View style={styles.primaryActionContent}>
            <Text style={styles.primaryActionTitle}>Re-evaluate Skills</Text>
            <Text style={styles.primaryActionSubtitle}>Update your skill levels</Text>
          </View>
          <Text style={styles.primaryActionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Settings Button */}
      <View style={styles.notificationButtonContainer}>
        <TouchableOpacity 
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <Text style={styles.notificationButtonText}>🔔 Notification Settings</Text>
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

      {/* Skills Re-evaluation Modal */}
      <Modal
        visible={showSkillsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSkillsModal(false)}
      >
        <SafeAreaView style={styles.modalFullScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSkillsModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Re-evaluate Your Skills</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.modalDescription}>
              Update your skill levels for each sport. Your evaluations help match you with appropriate games.
            </Text>

            {sports.map((sport) => (
              <SkillEvaluationCard
                key={sport.id}
                sport={sport}
                value={getSliderValue(sport.id)}
                onChange={(value) => handleSkillChange(sport.id, value)}
              />
            ))}

            <Button
              title="Save Changes"
              onPress={handleSaveSkills}
              loading={isUpdatingSkills}
              disabled={isUpdatingSkills}
              fullWidth
              size="large"
              style={styles.modalSaveButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface SkillEvaluationCardProps {
  sport: Sport;
  value: number;
  onChange: (value: number) => void;
}

function SkillEvaluationCard({ sport, value, onChange }: SkillEvaluationCardProps) {
  const hasSelection = value >= 0;
  const currentSkill = hasSelection ? SKILL_LEVELS[value] : null;

  return (
    <View style={[styles.sportCard, hasSelection && styles.sportCardSelected]}>
      <View style={styles.sportHeader}>
        <View style={styles.sportTitleRow}>
          <Text style={styles.sportIcon}>{sport.icon || '🏃'}</Text>
          <Text style={styles.sportName}>{sport.name}</Text>
        </View>
        {currentSkill && (
          <View style={styles.skillBadge}>
            <Text style={styles.skillBadgeText}>{SKILL_LEVEL_LABELS[currentSkill]}</Text>
          </View>
        )}
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={4}
          step={1}
          value={hasSelection ? value : 0}
          onValueChange={onChange}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.border}
          thumbTintColor={hasSelection ? Colors.primary : Colors.textTertiary}
        />
      </View>

      <View style={styles.labelsContainer}>
        {SKILL_LEVELS.map((level, index) => (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(index)}
            style={styles.labelButton}
          >
            <Text
              style={[
                styles.labelText,
                value === index && styles.labelTextActive,
              ]}
            >
              {SKILL_LEVEL_LABELS[level]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentSkill && (
        <Text style={styles.skillDescription}>
          {SKILL_LEVEL_DESCRIPTIONS[currentSkill]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
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
    borderWidth: 4,
    borderColor: Colors.border,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  username: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userId: {
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.medium,
  },
  primaryActionIcon: {
    fontSize: 32,
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  primaryActionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  primaryActionArrow: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
  },
  // Notification Settings Button
  notificationButtonContainer: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  notificationButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  notificationButtonText: {
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
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  errorSubtext: {
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  // Skills Modal (Full Screen)
  modalFullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalHeaderTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  modalCloseButton: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  modalDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  modalSaveButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.medium,
  },
  // Sport Card (for skill evaluation)
  sportCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sportCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sportIcon: {
    fontSize: 28,
  },
  sportName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  skillBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  skillBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  sliderContainer: {
    marginVertical: Spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  labelButton: {
    flex: 1,
    alignItems: 'center',
  },
  labelText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  labelTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  skillDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});

