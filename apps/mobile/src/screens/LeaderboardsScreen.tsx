import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card, EmptyState } from '../components';
import { getCurrentUser, getProfile } from '../services/auth';
import type { Profile } from '../types';

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
  const navigation = useNavigation();
  const [selectedSport, setSelectedSport] = useState<number>(1); // Default to Basketball
  const [profile, setProfile] = useState<Profile | null>(null);

  // Placeholder data - will be replaced with real data in Day 7
  const mockLeaderboard: LeaderboardEntry[] = [];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profileData = await getProfile(user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const getUserInitial = () => {
    if (profile?.username) {
      return profile.username.charAt(0).toUpperCase();
    }
    if (profile?.discord_username) {
      return profile.discord_username.charAt(0).toUpperCase();
    }
    return 'U';
  };

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
    <View style={styles.container}>
      <TopNav 
        title="NS SPORTS"
        rightAction={{
          icon: '👤',
          label: getUserInitial(),
          onPress: handleProfilePress,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leagues</Text>
        <Text style={styles.subtitle}>
          Coming Soon!
        </Text>
      </View>

      {/* Coming Soon Message */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState
          icon="🏆"
          title="Leagues Coming Soon"
          description="We're working on an exciting competitive league system. Stay tuned for rankings, tournaments, and more!"
        />
      </ScrollView>
    </View>
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

