import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Button } from '../components';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { getSports, saveSkillLevels, completeOnboarding } from '../services/auth';
import type { Sport, SkillLevel } from '../types';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_DESCRIPTIONS, SKILL_LEVELS } from '../types';

interface OnboardingScreenProps {
  userId: string;
  username: string;
  onComplete: () => void;
}

// interface SkillSelection {
//   sport_id: number;
//   skill_level: SkillLevel | null;
// }

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  userId,
  username,
  onComplete,
}) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [skillSelections, setSkillSelections] = useState<Record<number, SkillLevel | null>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const data = await getSports();
      setSports(data);
      
      // Initialize skill selections as null (undefined)
      const initialSelections: Record<number, SkillLevel | null> = {};
      data.forEach((sport) => {
        initialSelections[sport.id] = null;
      });
      setSkillSelections(initialSelections);
    } catch (error) {
      console.error('Error loading sports:', error);
      Alert.alert('Error', 'Failed to load sports');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (sportId: number, value: number) => {
    // Convert slider value (0-4) to skill level
    const skillLevel = SKILL_LEVELS[value];
    setSkillSelections((prev) => ({
      ...prev,
      [sportId]: skillLevel,
    }));
  };

  const getSliderValue = (sportId: number): number => {
    const skill = skillSelections[sportId];
    if (!skill) return -1; // -1 means not selected yet
    return SKILL_LEVELS.indexOf(skill);
  };

  const hasAtLeastOneSelection = (): boolean => {
    return Object.values(skillSelections).some((level) => level !== null);
  };

  const handleSubmit = async () => {
    if (!hasAtLeastOneSelection()) {
      Alert.alert(
        'Skill Evaluation Required',
        'Please evaluate your skill level for at least one sport to continue.'
      );
      return;
    }

    setSubmitting(true);

    try {
      // Filter out null selections and prepare data
      const skills = Object.entries(skillSelections)
        .filter(([_, level]) => level !== null)
        .map(([sportId, level]) => ({
          sport_id: parseInt(sportId),
          skill_level: level as SkillLevel,
        }));

      // Save skill levels
      await saveSkillLevels(userId, skills);

      // Mark onboarding as completed
      await completeOnboarding(userId);

      console.log('Onboarding completed successfully');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your skill levels. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = Object.values(skillSelections).filter((level) => level !== null).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {username}! 👋</Text>
          <Text style={styles.title}>Evaluate Your Skills</Text>
          <Text style={styles.subtitle}>
            Help us match you with the right games by evaluating your skill level for each sport.
            You must evaluate at least one sport to continue.
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            {selectedCount} of {sports.length} sports evaluated
          </Text>
          <Text style={styles.progressHint}>
            {selectedCount === 0
              ? 'Select at least one sport to continue'
              : selectedCount < sports.length
              ? 'You can skip sports you don\'t play'
              : 'All sports evaluated! ✨'}
          </Text>
        </View>

        {/* Sports List */}
        <View style={styles.sportsList}>
          {sports.map((sport) => (
            <SportSkillCard
              key={sport.id}
              sport={sport}
              value={getSliderValue(sport.id)}
              onChange={(value) => handleSkillChange(sport.id, value)}
            />
          ))}
        </View>

        {/* Submit Button */}
        <Button
          title={submitting ? 'Saving...' : 'Complete Setup'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || !hasAtLeastOneSelection()}
          fullWidth
          size="large"
          style={styles.submitButton}
        />

        {/* Helper Text */}
        <Text style={styles.helperText}>
          You can always update your skill levels later in your profile settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Sport Skill Card Component
interface SportSkillCardProps {
  sport: Sport;
  value: number; // -1 for not selected, 0-4 for skill levels
  onChange: (value: number) => void;
}

const SportSkillCard: React.FC<SportSkillCardProps> = ({ sport, value, onChange }) => {
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

      {/* Slider */}
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

      {/* Skill Level Labels */}
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

      {/* Current Skill Description */}
      {currentSkill && (
        <Text style={styles.skillDescription}>
          {SKILL_LEVEL_DESCRIPTIONS[currentSkill]}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },

  // Progress Card
  progressCard: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  progressHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
  },

  // Sports List
  sportsList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Sport Card
  sportCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
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

  // Slider
  sliderContainer: {
    marginVertical: Spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },

  // Labels
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

  // Submit Button
  submitButton: {
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },

  // Helper Text
  helperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

