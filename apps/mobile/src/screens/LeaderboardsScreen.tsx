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
import { Card, EmptyState } from '../components';

// Sport icons (same as FreePlayScreen)
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

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  elo: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

export const LeaderboardsScreen: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<number>(1); // Default to Basketball

  // Placeholder data - will be replaced with real data in Day 7
  const mockLeaderboard: LeaderboardEntry[] = [];

  const renderSportSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sportSelector}
      contentContainerStyle={styles.sportSelectorContent}
    >
      {SPORTS.map(sport => (
        <TouchableOpacity
          key={sport.id}
          style={[
            styles.sportTab,
            selectedSport === sport.id && styles.sportTabActive,
          ]}
          onPress={() => setSelectedSport(sport.id)}
        >
          <Text style={styles.sportTabEmoji}>{sport.emoji}</Text>
          <Text
            style={[
              styles.sportTabText,
              selectedSport === sport.id && styles.sportTabTextActive,
            ]}
          >
            {sport.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLeaderboardEntry = (entry: LeaderboardEntry) => {
    const winRate = entry.gamesPlayed > 0 
      ? ((entry.wins / entry.gamesPlayed) * 100).toFixed(0) 
      : 0;

    return (
      <Card key={entry.rank} style={styles.leaderboardCard}>
        <View style={styles.leaderboardRow}>
          {/* Rank Badge */}
          <View style={[
            styles.rankBadge,
            entry.rank === 1 && styles.rankBadgeGold,
            entry.rank === 2 && styles.rankBadgeSilver,
            entry.rank === 3 && styles.rankBadgeBronze,
          ]}>
            <Text style={styles.rankText}>#{entry.rank}</Text>
          </View>

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{entry.avatar}</Text>
            </View>
            <View style={styles.playerDetails}>
              <Text style={styles.playerName}>{entry.username}</Text>
              <Text style={styles.playerStats}>
                {entry.wins}W - {entry.losses}L ({winRate}%)
              </Text>
            </View>
          </View>

          {/* ELO Rating */}
          <View style={styles.eloContainer}>
            <Text style={styles.eloLabel}>ELO</Text>
            <Text style={styles.eloValue}>{entry.elo}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const selectedSportName = SPORTS.find(s => s.id === selectedSport)?.name;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.subtitle}>
          Compete and climb the rankings in your favorite sports
        </Text>
      </View>

      {/* Sport Selector */}
      {renderSportSelector()}

      {/* Leaderboard List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockLeaderboard.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No Rankings Yet"
            description={`Be the first to compete in ${selectedSportName}! Challenge other players to start building your ranking.`}
          />
        ) : (
          <View style={styles.leaderboardList}>
            {mockLeaderboard.map(renderLeaderboardEntry)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
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
  sportSelector: {
    maxHeight: 80,
  },
  sportSelectorContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sportTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sportTabActive: {
    backgroundColor: Colors.primary,
    ...Shadows.small,
  },
  sportTabEmoji: {
    fontSize: Typography.fontSize.lg,
  },
  sportTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  sportTabTextActive: {
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  leaderboardList: {
    gap: Spacing.sm,
  },
  leaderboardCard: {
    marginBottom: Spacing.sm,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
  },
  rankBadgeSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBadgeBronze: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  playerStats: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  eloContainer: {
    alignItems: 'flex-end',
  },
  eloLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  eloValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});

