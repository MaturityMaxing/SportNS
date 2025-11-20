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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Clock, Users, BarChart3, CheckCircle2, Activity } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card, EmptyState, SportIcon } from '../components';
import { getUserGames, subscribeToGameUpdates, unsubscribeFromGameUpdates, triggerAutoEndOldGames } from '../services/games';
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

  // Reload data when screen comes into focus (e.g., navigating back from GameDetail or PostGame)
  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        // Trigger auto-end for old games when screen comes into focus
        triggerAutoEndOldGames();
        loadGames(currentUserId);
      }
    }, [currentUserId])
  );

  const setupRealtimeSubscriptions = () => {
    // Subscribe to game updates (status changes, new games, etc.)
    realtimeChannelRef.current = subscribeToGameUpdates(() => {
      console.log('Game update detected in My Games');
      if (currentUserId) {
        loadGames(currentUserId);
      }
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Trigger auto-end for old games (fallback if cron isn't running)
      // This runs in the background and doesn't block the UI
      triggerAutoEndOldGames();
      
      const user = await getCurrentUser();
      
      if (user) {
        setCurrentUserId(user.id);
        
        // Load profile only if not already loaded
        if (!profile) {
          const profileData = await getProfile(user.id);
          setProfile(profileData);
        }
        
        // Load games
        await loadGames(user.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your games');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGames = async (userId: string) => {
    try {
      const gamesData = await getUserGames(userId);
      
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
    } catch (error) {
      console.error('Error loading games:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    if (!currentUserId) return;
    
    setIsRefreshing(true);
    try {
      await loadGames(currentUserId);
    } catch (error) {
      console.error('Error refreshing games:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleGamePress = (gameId: string) => {
    (navigation as any).navigate('GameDetail', { gameId });
  };

  const formatTime = (dateString: string, timeType: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (timeType === 'now') {
      return 'Right now!';
    }

    if (diffInHours < 1) {
      const diffInMinutes = Math.round(diffInHours * 60);
      return `In ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    }

    // Check if it's today (same calendar day)
    const isToday = date.getFullYear() === now.getFullYear() &&
                     date.getMonth() === now.getMonth() &&
                     date.getDate() === now.getDate();
    
    // Check if it's tomorrow (next calendar day)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.getFullYear() === tomorrow.getFullYear() &&
                        date.getMonth() === tomorrow.getMonth() &&
                        date.getDate() === tomorrow.getDate();

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeString}`;
    }

    if (isTomorrow) {
      return `Tomorrow at ${timeString}`;
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
            label: getUserInitial(),
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
        {games.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon={Activity}
              title="No Games Yet"
              description="Join games from the Dashboard to see them here"
            />
          </View>
        ) : (
          <View style={styles.gamesSection}>
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={handleGamePress}
                formatTime={formatTime}
              />
            ))}
          </View>
        )}
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
        {/* Header - Minimal */}
        <View style={styles.gameHeader}>
          <View style={styles.sportIconContainer}>
            <SportIcon sport={game.sport} size={32} />
          </View>
          <View style={styles.gameInfoCompact}>
            {/* Sport Name */}
            <Text style={styles.sportName}>{game.sport?.name || 'Unknown Sport'}</Text>
            
            <View style={styles.detailRow}>
              <Clock size={16} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.detailText}>{timeString}</Text>
            </View>
            <View style={styles.detailRow}>
              <Users size={16} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.detailText}>
                {(() => {
                  const current = game.current_players ?? 0;
                  const max = game.max_players;
                  const min = game.min_players;
                  const isConfirmed = current >= min;
                  
                  if (isConfirmed) {
                    return `${current}/${max}`;
                  } else {
                    const needed = min - current;
                    return `${current}/${max} (needs ${needed} more)`;
                  }
                })()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <BarChart3 size={16} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.detailText}>
                {game.skill_level_min && game.skill_level_max
                  ? `${SKILL_LEVEL_LABELS[game.skill_level_min]} - ${SKILL_LEVEL_LABELS[game.skill_level_max]}`
                  : 'All levels'}
              </Text>
            </View>
            {isConfirmed && (
              <View style={styles.confirmedBadgeInline}>
                <CheckCircle2 size={14} color={Colors.textInverse} strokeWidth={2} />
                <Text style={styles.confirmedBadgeText}>Confirmed</Text>
              </View>
            )}
          </View>
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
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  // Header
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.md,
  },
  // Empty State Container
  emptyStateContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  gameInfoCompact: {
    flex: 1,
    gap: Spacing.xs,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
  },
  sportName: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  confirmedBadgeInline: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  confirmedBadgeText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
});

