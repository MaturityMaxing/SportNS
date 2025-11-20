import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PlayerCountSlider } from './PlayerCountSlider';
import { SkillLevelRangeSlider } from './SkillLevelRangeSlider';
import { Colors, Spacing, Typography } from '../theme';
import type { SkillLevel } from '../types';

type PlayersAndSkillStepProps = {
  minPlayers: number;
  maxPlayers: number;
  onMinPlayersChange: (value: number) => void;
  onMaxPlayersChange: (value: number) => void;
  minSkillLevel: SkillLevel;
  maxSkillLevel: SkillLevel;
  onMinSkillLevelChange: (level: SkillLevel) => void;
  onMaxSkillLevelChange: (level: SkillLevel) => void;
  absoluteMinPlayers?: number;
  absoluteMaxPlayers?: number;
};

/**
 * PlayersAndSkillStep Component
 * Step 2 of Post Game Flow
 * Combines player count and skill level restriction
 */
export const PlayersAndSkillStep: React.FC<PlayersAndSkillStepProps> = ({
  minPlayers,
  maxPlayers,
  onMinPlayersChange,
  onMaxPlayersChange,
  minSkillLevel,
  maxSkillLevel,
  onMinSkillLevelChange,
  onMaxSkillLevelChange,
  absoluteMinPlayers = 2,
  absoluteMaxPlayers = 20,
}) => {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Players & Skill Level</Text>
      <Text style={styles.subtitle}>Set player count and skill requirements</Text>

      {/* Player Count Section */}
      <View style={styles.section}>
        <PlayerCountSlider
          minPlayers={minPlayers}
          maxPlayers={maxPlayers}
          onMinPlayersChange={onMinPlayersChange}
          onMaxPlayersChange={onMaxPlayersChange}
          absoluteMin={absoluteMinPlayers}
          absoluteMax={absoluteMaxPlayers}
        />
      </View>

      {/* Skill Level Section */}
      <View style={styles.section}>
        <SkillLevelRangeSlider
          minSkillLevel={minSkillLevel}
          maxSkillLevel={maxSkillLevel}
          onMinSkillLevelChange={onMinSkillLevelChange}
          onMaxSkillLevelChange={onMaxSkillLevelChange}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
  section: {
    marginBottom: Spacing.md,
  },
});
