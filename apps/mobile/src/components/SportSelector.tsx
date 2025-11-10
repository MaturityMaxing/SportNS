import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import type { Sport } from '../types';

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

      <ScrollView 
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {sports.map((sport) => {
          const isSelected = selectedSportId === sport.id;
          
          return (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportBox,
                isSelected && styles.sportBoxSelected,
              ]}
              onPress={() => onSelectSport(sport.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <Text style={[
                styles.sportName,
                isSelected && styles.sportNameSelected,
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  sportBox: {
    width: '48%',
    aspectRatio: 1.2,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  sportBoxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    ...Shadows.medium,
  },
  sportIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  sportName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  sportNameSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});

