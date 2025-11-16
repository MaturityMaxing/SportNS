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
import { getUserStats, type UserStats } from '../services/games';
import type { Profile, Sport, SkillLevel, PlayerSkillLevel } from '../types';
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
  const [currentSkills, setCurrentSkills] = useState<PlayerSkillLevel[]>([]);
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false);

  // User statistics
  const [userStats, setUserStats] = useState<UserStats>({
    totalGames: 0,
    completedGames: 0,
    activeGames: 0,
    gamesCreated: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (user) {
        const profileData = await getProfile(user.id);
        if (!profileData) {
          // Profile doesn't exist yet, might still be creating
          console.warn('Profile not found, it may still be creating. Retrying in 2 seconds...');
          // Wait a bit and retry once
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryProfileData = await getProfile(user.id);
          setProfile(retryProfileData);
        } else {
          setProfile(profileData);
          
          // Load user's skills, sports, and stats in parallel
          try {
            const [skillsData, sportsData, stats] = await Promise.all([
              getSkillLevels(user.id),
              getSports(),
              getUserStats(user.id),
            ]);
            setCurrentSkills(skillsData);
            setSports(sportsData);
            setUserStats(stats);
          } catch (error) {
            console.error('Error loading profile data:', error);
          }
        }
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
      setCurrentSkills(skillsData);

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
      
      // Reload current skills
      const updatedSkills = await getSkillLevels(profile.id);
      setCurrentSkills(updatedSkills);
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <TouchableOpacity onPress={handleChangeUsername}>
            <Text style={styles.infoValueLink}>{profile.username || profile.discord_username}</Text>
          </TouchableOpacity>
        </View>
        <InfoRow 
          label="Member Since" 
          value={new Date(profile.created_at).toLocaleDateString()}
        />
        
        <View style={styles.actionButtonsRow}>
          <Button
            title="Change Username"
            onPress={handleChangeUsername}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Re-evaluate Skills - More Prominent */}
      <TouchableOpacity 
        style={styles.skillsCalloutCard}
        onPress={handleReEvaluateSkills}
        activeOpacity={0.7}
      >
        <View style={styles.skillsCalloutHeader}>
          <Text style={styles.skillsCalloutIcon}>⚡</Text>
          <View style={styles.skillsCalloutContent}>
            <Text style={styles.skillsCalloutTitle}>Update Your Skills</Text>
            <Text style={styles.skillsCalloutSubtitle}>
              {currentSkills.length > 0 
                ? `You have ${currentSkills.length} sport${currentSkills.length !== 1 ? 's' : ''} evaluated. Tap to update.`
                : 'Evaluate your skills to find better game matches!'}
            </Text>
          </View>
          <Text style={styles.skillsCalloutArrow}>→</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Games Played" 
            value={userStats.totalGames.toString()} 
            icon="⚽"
            subtitle={`${userStats.completedGames} completed`}
          />
          <StatCard 
            title="Active Games" 
            value={userStats.activeGames.toString()} 
            icon="🏃"
            subtitle="Currently playing"
          />
          <StatCard 
            title="Games Created" 
            value={userStats.gamesCreated.toString()} 
            icon="⚡"
            subtitle="You organized"
          />
          <StatCard 
            title="Sports" 
            value={currentSkills.length.toString()} 
            icon="🏀"
            subtitle="Skills evaluated"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>🔔 Notification Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>🎨 App Preferences</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>ℹ️ About SportNS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>SportNS v1.0.0</Text>
        <Text style={styles.footerText}>Community Sports Platform</Text>
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

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
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
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
    ...Shadows.large,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    borderWidth: 5,
    borderColor: Colors.textInverse,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.textInverse,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: Typography.fontSize.huge * 1.2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  username: {
    fontSize: Typography.fontSize.xxl * 1.1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userId: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.9,
    fontWeight: Typography.fontWeight.medium,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg * 1.05,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  statIcon: {
    fontSize: Typography.fontSize.xxxl * 1.2,
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  statSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingButton: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  signOutButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginVertical: 2,
    fontWeight: Typography.fontWeight.medium,
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
  // Action buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  infoValueLink: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  // Skills display
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  skillChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    ...Shadows.small,
  },
  skillChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
    fontWeight: Typography.fontWeight.semibold,
  },
  noSkillsText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.md,
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
  // Skills Callout Card
  skillsCalloutCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.large,
  },
  skillsCalloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skillsCalloutIcon: {
    fontSize: 40,
  },
  skillsCalloutContent: {
    flex: 1,
  },
  skillsCalloutTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  skillsCalloutSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.9,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  skillsCalloutArrow: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
  },
});

