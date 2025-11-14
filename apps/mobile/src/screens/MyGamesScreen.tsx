import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card, EmptyState } from '../components';
import { getUserGames, subscribeToGameUpdates, unsubscribeFromGameUpdates } from '../services/games';
import { getCurrentUser, getProfile } from '../services/auth';
import type { GameEventWithDetails, Profile } from '../types';
import { SKILL_LEVEL_LABELS } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * MyGamesScreen - Display games the user has joined
 */
export const MyGamesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [games, setGames] = useState<GameEventWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    loadData();
    
    // Cleanup subscription on unmount
    return () => {
      if (realtimeChannelRef.current) {
        unsubscribeFromGameUpdates(realtimeChannelRef.current);
      }
    };
  }, []);

  // Setup real-time subscriptions after initial load
  useEffect(() => {
    if (currentUserId) {
      setupRealtimeSubscriptions();
    }
  }, [currentUserId]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to game updates (status changes, new games, etc.)
    realtimeChannelRef.current = subscribeToGameUpdates(() => {
      console.log('Game update detected in My Games');
      loadData();
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        const [profileData, gamesData] = await Promise.all([
          getProfile(user.id),
          getUserGames(user.id),
        ]);
        
        setCurrentUserId(user.id);
        setProfile(profileData);
        
        // Sort games: confirmed first, then by closest time
        const sortedGames = gamesData.sort((a, b) => {
          // First sort by status (confirmed games first)
          const aIsConfirmed = a.status === 'confirmed';
          const bIsConfirmed = b.status === 'confirmed';
          
          if (aIsConfirmed && !bIsConfirmed) return -1;
          if (!aIsConfirmed && bIsConfirmed) return 1;
          
          // If same status, sort by time (closest first)
          const aTime = new Date(a.scheduled_time).getTime();
          const bTime = new Date(b.scheduled_time).getTime();
          return aTime - bTime;
        });
        
        setGames(sortedGames);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetail' as never, { gameId } as never);
  };

  const formatTime = (dateString: string, timeType: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (timeType === 'now') {
      return 'Right now! 🏃‍♂️';
    }

    if (diffInHours < 1) {
      const diffInMinutes = Math.round(diffInHours * 60);
      return `In ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    }

    if (diffInHours < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopNav 
          title="NS SPORTS" 
          rightAction={{
            icon: '👤',
            onPress: handleProfilePress,
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading your games...</Text>
        </View>
      </View>
    );
  }

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
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Games</Text>
          <Text style={styles.subtitle}>
            {games.length === 0 
              ? 'You haven\'t joined any games yet' 
              : `${games.length} game${games.length !== 1 ? 's' : ''} joined`}
          </Text>
        </View>

        {/* Games List */}
        <View style={styles.gamesSection}>
          {games.length === 0 ? (
            <EmptyState
              icon="🎮"
              title="No Games Yet"
              description="Join games from the Dashboard to see them here"
            />
          ) : (
            games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={handleGamePress}
                formatTime={formatTime}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Game Card Component
interface GameCardProps {
  game: GameEventWithDetails;
  onPress: (gameId: string) => void;
  formatTime: (dateString: string, timeType: string) => string;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPress, formatTime }) => {
  const isConfirmed = game.status === 'confirmed';
  const timeString = formatTime(game.scheduled_time, game.time_type);

  return (
    <TouchableOpacity
      style={styles.gameCardTouchable}
      onPress={() => onPress(game.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.gameCard}>
        {/* Header */}
        <View style={styles.gameHeader}>
          <View style={styles.gameTitleRow}>
            <Text style={styles.sportIcon}>{game.sport?.icon || '🏃'}</Text>
            <View>
              <Text style={styles.gameSportName}>{game.sport?.name || 'Sport'}</Text>
              <Text style={styles.gameCreator}>
                by {game.creator?.username || game.creator?.discord_username || 'Unknown'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, isConfirmed && styles.statusBadgeConfirmed]}>
            <Text style={styles.statusBadgeText}>
              {isConfirmed ? '✓ Confirmed' : '⏳ Waiting'}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.gameDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⏰</Text>
            <Text style={styles.detailText}>{timeString}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailText}>
              {game.current_players}/{game.max_players} players
              {game.min_players > 0 && ` (min ${game.min_players})`}
            </Text>
          </View>
          {(game.skill_level_min || game.skill_level_max) && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📊</Text>
              <Text style={styles.detailText}>
                Skill: {game.skill_level_min && SKILL_LEVEL_LABELS[game.skill_level_min]}
                {game.skill_level_min && game.skill_level_max && ' - '}
                {game.skill_level_max && SKILL_LEVEL_LABELS[game.skill_level_max]}
              </Text>
            </View>
          )}
        </View>

        {/* Tap Hint */}
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap for details →</Text>
        </View>
      </Card>
    </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  // Header
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
  // Games Section
  gamesSection: {
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.md,
  },
  // Game Card
  gameCardTouchable: {
    marginBottom: Spacing.md,
  },
  gameCard: {
    marginBottom: 0,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  sportIcon: {
    fontSize: 32,
  },
  gameSportName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  gameCreator: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeConfirmed: {
    backgroundColor: Colors.available,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  gameDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailIcon: {
    fontSize: 16,
    width: 20,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  tapHint: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundTertiary,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

