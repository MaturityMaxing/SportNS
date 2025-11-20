import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import type { Sport } from '../types';
import { SportIcon } from './SportIcon';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = Spacing.md * 2; // padding on both sides
const GAP = Spacing.sm; // 8px gap between items
const AVAILABLE_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING;
const BOX_WIDTH = (AVAILABLE_WIDTH - GAP * 2) / 3; // 3 boxes with 2 gaps

type SportSelectorProps = {
  sports: Sport[];
  selectedSportId: number | null;
  onSelectSport: (sportId: number) => void;
};

/**
 * SportSelector Component
 * Step 1 of Post Game Flow
 * Grid of sport boxes with icons for single selection
 */
export const SportSelector: React.FC<SportSelectorProps> = ({
  sports,
  selectedSportId,
  onSelectSport,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Sport</Text>
      <Text style={styles.subtitle}>Choose which sport you want to play</Text>

      <View style={styles.grid}>
        {sports.map((sport, index) => {
          const isSelected = selectedSportId === sport.id;
          const isLastInRow = (index + 1) % 3 === 0;
          
          return (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportBox,
                isSelected && styles.sportBoxSelected,
                isLastInRow && styles.sportBoxLastInRow,
              ]}
              onPress={() => onSelectSport(sport.id)}
              activeOpacity={0.7}
            >
              <SportIcon sport={sport} size={36} />
              <Text style={[
                styles.sportName,
                isSelected && styles.sportNameSelected,
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: Spacing.md,
  },
  sportBox: {
    width: BOX_WIDTH,
    height: BOX_WIDTH,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    marginRight: GAP,
    marginBottom: GAP,
    ...Shadows.small,
  },
  sportBoxLastInRow: {
    marginRight: 0,
  },
  sportBoxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    ...Shadows.medium,
  },
  sportName: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  sportNameSelected: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});

