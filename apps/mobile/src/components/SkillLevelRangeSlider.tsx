import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MultiRangeSlider } from './MultiRangeSlider';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { SKILL_LEVELS, SKILL_LEVEL_LABELS, type SkillLevel } from '../types';

type SkillLevelRangeSliderProps = {
  minSkillLevel: SkillLevel;
  maxSkillLevel: SkillLevel;
  onMinSkillLevelChange: (level: SkillLevel) => void;
  onMaxSkillLevelChange: (level: SkillLevel) => void;
};

/**
 * SkillLevelRangeSlider Component
 * Multi-range slider for skill level restriction (always visible)
 */
export const SkillLevelRangeSlider: React.FC<SkillLevelRangeSliderProps> = ({
  minSkillLevel,
  maxSkillLevel,
  onMinSkillLevelChange,
  onMaxSkillLevelChange,
}) => {
  const getSkillIndex = (level: SkillLevel): number => {
    return SKILL_LEVELS.indexOf(level);
  };

  const getSkillFromIndex = (index: number): SkillLevel => {
    return SKILL_LEVELS[index];
  };

  const handleValuesChange = (minIndex: number, maxIndex: number) => {
    onMinSkillLevelChange(getSkillFromIndex(minIndex));
    onMaxSkillLevelChange(getSkillFromIndex(maxIndex));
  };

  const formatSkillValue = (index: number): string => {
    return SKILL_LEVEL_LABELS[getSkillFromIndex(index)];
  };

  const getSummaryText = () => {
    const allSkills = minSkillLevel === SKILL_LEVELS[0] && maxSkillLevel === SKILL_LEVELS[4];
    
    if (allSkills) {
      return (
        <Text style={styles.summaryText}>
          All skill levels welcome
        </Text>
      );
    }

    if (minSkillLevel === maxSkillLevel) {
      return (
        <Text style={styles.summaryText}>
          Only{' '}
          <Text style={styles.summaryHighlight}>
            {SKILL_LEVEL_LABELS[minSkillLevel]}
          </Text>
          {' players'}
        </Text>
      );
    }

    return (
      <Text style={styles.summaryText}>
        Only{' '}
        <Text style={styles.summaryHighlight}>
          {SKILL_LEVEL_LABELS[minSkillLevel]}
        </Text>
        {' to '}
        <Text style={styles.summaryHighlight}>
          {SKILL_LEVEL_LABELS[maxSkillLevel]}
        </Text>
        {' players'}
      </Text>
    );
  };

  const currentMinIndex = getSkillIndex(minSkillLevel);
  const currentMaxIndex = getSkillIndex(maxSkillLevel);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Skill Level</Text>
      
      <MultiRangeSlider
        min={0}
        max={SKILL_LEVELS.length - 1}
        minValue={currentMinIndex}
        maxValue={currentMaxIndex}
        step={1}
        onValuesChange={handleValuesChange}
        minLabel="Min Skill"
        maxLabel="Max Skill"
        formatValue={formatSkillValue}
      />

      {/* Summary */}
      <View style={styles.summaryBox}>
        {getSummaryText()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  summaryBox: {
    backgroundColor: Colors.backgroundTertiary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  summaryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryHighlight: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
