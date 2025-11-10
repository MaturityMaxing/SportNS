import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MultiRangeSlider } from './MultiRangeSlider';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type PlayerCountSliderProps = {
  minPlayers: number;
  maxPlayers: number;
  onMinPlayersChange: (value: number) => void;
  onMaxPlayersChange: (value: number) => void;
  absoluteMin?: number;
  absoluteMax?: number;
};

/**
 * PlayerCountSlider Component
 * Multi-range slider for min and max player count
 */
export const PlayerCountSlider: React.FC<PlayerCountSliderProps> = ({
  minPlayers,
  maxPlayers,
  onMinPlayersChange,
  onMaxPlayersChange,
  absoluteMin = 2,
  absoluteMax = 20,
}) => {
  const handleValuesChange = (min: number, max: number) => {
    onMinPlayersChange(min);
    onMaxPlayersChange(max);
  };

  const getSummaryText = () => {
    if (minPlayers === maxPlayers) {
      return (
        <Text style={styles.summaryText}>
          Looking for{' '}
          <Text style={styles.summaryHighlight}>{minPlayers}</Text>
          {' players'}
        </Text>
      );
    }
    return (
      <Text style={styles.summaryText}>
        Looking for{' '}
        <Text style={styles.summaryHighlight}>{minPlayers}</Text>
        {' to '}
        <Text style={styles.summaryHighlight}>{maxPlayers}</Text>
        {' players'}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderSection}>
        <Text style={styles.sectionTitle}>Player Count</Text>
        
        <MultiRangeSlider
          min={absoluteMin}
          max={absoluteMax}
          minValue={minPlayers}
          maxValue={maxPlayers}
          step={1}
          onValuesChange={handleValuesChange}
          minLabel="Min"
          maxLabel="Max"
        />

        {/* Visual Summary */}
        <View style={styles.summaryBox}>
          {getSummaryText()}
        </View>
      </View>

      <View style={styles.helperBox}>
        <Text style={styles.helperText}>
          💡 Drag the handles to set your player range
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sliderSection: {
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
  },
  summaryHighlight: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  helperBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
});
