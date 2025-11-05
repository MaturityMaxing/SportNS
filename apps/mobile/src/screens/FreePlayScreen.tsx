import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { EmptyState } from '../components';

// Sport icons (emoji for now, can be replaced with icon library later)
const SPORTS = [
  { id: 1, name: 'Basketball', emoji: '🏀', slug: 'basketball' },
  { id: 2, name: 'Pickleball', emoji: '🏓', slug: 'pickleball' },
  { id: 3, name: 'Volleyball', emoji: '🏐', slug: 'volleyball' },
  { id: 4, name: 'Football', emoji: '🏈', slug: 'football' },
  { id: 5, name: 'Ping Pong', emoji: '🏓', slug: 'ping-pong' },
  { id: 6, name: 'Badminton', emoji: '🏸', slug: 'badminton' },
  { id: 7, name: 'Tennis', emoji: '🎾', slug: 'tennis' },
  { id: 8, name: 'Golf', emoji: '⛳', slug: 'golf' },
  { id: 9, name: 'Running', emoji: '🏃', slug: 'running' },
];

type AvailabilityStatus = {
  [sportId: number]: boolean;
};

export const FreePlayScreen: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [availability, setAvailability] = useState<AvailabilityStatus>({});

  const toggleAvailability = (sportId: number) => {
    setAvailability(prev => ({
      ...prev,
      [sportId]: !prev[sportId],
    }));
  };

  const renderSportGrid = () => (
    <View style={styles.sportGrid}>
      {SPORTS.map(sport => {
        const isAvailable = availability[sport.id] || false;
        return (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportCard,
              selectedSport === sport.id && styles.sportCardSelected,
            ]}
            onPress={() => setSelectedSport(sport.id)}
          >
            <Text style={styles.sportEmoji}>{sport.emoji}</Text>
            <Text style={styles.sportName}>{sport.name}</Text>
            
            <TouchableOpacity
              style={[
                styles.availabilityBadge,
                isAvailable ? styles.availableBadge : styles.unavailableBadge,
              ]}
              onPress={() => toggleAvailability(sport.id)}
            >
              <Text
                style={[
                  styles.availabilityText,
                  isAvailable && styles.availableText,
                ]}
              >
                {isAvailable ? '✓ Available' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderAvailablePlayers = () => {
    if (!selectedSport) {
      return (
        <EmptyState
          icon="👈"
          title="Select a Sport"
          description="Choose a sport from the grid above to see who's available to play"
        />
      );
    }

    const sport = SPORTS.find(s => s.id === selectedSport);
    
    // Placeholder for when no players are available
    // This will be replaced with real data in Day 5
    return (
      <View style={styles.playersContainer}>
        <Text style={styles.sectionTitle}>
          Available Players - {sport?.name}
        </Text>
        <EmptyState
          icon="🎾"
          title="No Players Available"
          description="Be the first to mark yourself as available for this sport!"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Free Play</Text>
          <Text style={styles.subtitle}>
            Toggle your availability and find players ready to play
          </Text>
        </View>

        {/* Sport Selection Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Sport</Text>
          {renderSportGrid()}
        </View>

        {/* Available Players List */}
        <View style={[styles.section, styles.playersSection]}>
          {renderAvailablePlayers()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.md,
  },
  section: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  playersSection: {
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sportCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.small,
  },
  sportCardSelected: {
    borderColor: Colors.primary,
    ...Shadows.medium,
  },
  sportEmoji: {
    fontSize: 36,
    marginBottom: Spacing.xs,
  },
  sportName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  availabilityBadge: {
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
    minWidth: 90,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableBadge: {
    backgroundColor: Colors.available,
  },
  unavailableBadge: {
    backgroundColor: Colors.backgroundTertiary,
  },
  availabilityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * 1.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  availableText: {
    color: Colors.textInverse,
  },
  playersContainer: {
    minHeight: 300,
  },
});

