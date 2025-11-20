import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { getCurrentUser, getSkillLevels, saveSkillLevels, getSports } from '../services/auth';
import type { Sport, SkillLevel } from '../types';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_DESCRIPTIONS, SKILL_LEVELS } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { Button, TopNav, SportIcon } from '../components';

/**
 * ReEvaluateSkillsScreen - Full screen for updating skill levels
 */
export const ReEvaluateSkillsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [sports, setSports] = useState<Sport[]>([]);
  const [skillSelections, setSkillSelections] = useState<Record<number, SkillLevel | null>>({});
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in');
        navigation.goBack();
        return;
      }

      setUserId(user.id);

      // Load sports and current skills
      const [sportsData, skillsData] = await Promise.all([
        getSports(),
        getSkillLevels(user.id),
      ]);

      setSports(sportsData);

      // Initialize skill selections with current values
      const initialSelections: Record<number, SkillLevel | null> = {};
      sportsData.forEach((sport) => {
        const existingSkill = skillsData.find(s => s.sport_id === sport.id);
        initialSelections[sport.id] = existingSkill?.skill_level || null;
      });
      setSkillSelections(initialSelections);
    } catch (error) {
      console.error('Error loading skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setIsLoading(false);
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
    if (!userId) return;

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
      await saveSkillLevels(userId, selectedSkills);
      Alert.alert('Success', 'Skills updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating skills:', error);
      Alert.alert('Error', 'Failed to update skills');
    } finally {
      setIsUpdatingSkills(false);
    }
  };

  if (isLoading) {
  return (
    <View style={styles.container}>
      <TopNav
        title="Re-evaluate Skills"
        centered
        leftAction={{
          icon: ArrowLeft,
          onPress: () => navigation.goBack(),
        }}
      />
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading skills...</Text>
      </View>
    </View>
  );
  }

  return (
    <View style={styles.container}>
      <TopNav
        title="Re-evaluate Skills"
        centered
        leftAction={{
          icon: ArrowLeft,
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <Text style={styles.description}>
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
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
};

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
          <SportIcon sport={sport} size={24} />
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
  scrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  saveButton: {
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
  sportName: {
    fontFamily: Typography.fontFamily.bold,
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
    fontFamily: Typography.fontFamily.bold,
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
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  labelTextActive: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  skillDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});

