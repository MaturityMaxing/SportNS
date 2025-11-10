import React, { useState, useEffect } from 'react';
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
import { getActiveGames, joinGame, leaveGame, hasJoinedGame } from '../services/games';
import { getCurrentUser, getProfile } from '../services/auth';
import { getSports } from '../services/auth';
import type { GameEventWithDetails, Sport, Profile } from '../types';
import { SKILL_LEVEL_LABELS } from '../types';

/**
 * DashboardScreen - Display active game events
 * Shows list of available games with filtering by sport
 */
export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [games, setGames] = useState<GameEventWithDetails[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadGames();
    }
  }, [selectedSport]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        const [profileData, sportsData] = await Promise.all([
          getProfile(user.id),
          getSports(),
        ]);
        
        setCurrentUserId(user.id);
        setProfile(profileData);
        setSports(sportsData);
        
        await loadGames();
      } else {
        const sportsData = await getSports();
        setSports(sportsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handlePostGame = () => {
    navigation.navigate('PostGame' as never);
  };

  const loadGames = async () => {
    try {
      const gamesData = await getActiveGames(selectedSport || undefined);
      
      // Check if user has joined each game
      if (currentUserId) {
        const gamesWithJoinStatus = await Promise.all(
          gamesData.map(async (game) => {
            const joined = await hasJoinedGame(game.id, currentUserId);
            return { ...game, is_joined: joined };
          })
        );
        setGames(gamesWithJoinStatus);
      } else {
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGames();
    setIsRefreshing(false);
  };

  const handleJoinGame = async (gameId: string) => {
    if (!currentUserId) return;

    try {
      await joinGame(gameId, currentUserId);
      Alert.alert('Success', 'You have joined the game!');
      await loadGames();
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Failed to join game. The game might be full.');
    }
  };

  const handleLeaveGame = async (gameId: string) => {
    if (!currentUserId) return;

    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGame(gameId, currentUserId);
              Alert.alert('Success', 'You have left the game');
              await loadGames();
            } catch (error) {
              console.error('Error leaving game:', error);
              Alert.alert('Error', 'Failed to leave game');
            }
          },
        },
      ]
    );
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

  const filteredGames = selectedSport
    ? games.filter(game => game.sport_id === selectedSport)
    : games;

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
          <Text style={styles.loadingText}>Loading games...</Text>
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
        {/* Sport Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Sport</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSport === null && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSport(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSport === null && styles.filterChipTextActive,
                ]}
              >
                All Sports
              </Text>
            </TouchableOpacity>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.filterChip,
                  selectedSport === sport.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedSport(sport.id)}
              >
                <Text style={styles.filterChipIcon}>{sport.icon || '🏃'}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSport === sport.id && styles.filterChipTextActive,
                  ]}
                >
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Post Game Button */}
        <View style={styles.postButtonSection}>
          <TouchableOpacity 
            style={styles.postButton}
            onPress={handlePostGame}
            activeOpacity={0.8}
          >
            <Text style={styles.postButtonIcon}>📢</Text>
            <View style={styles.postButtonTextContainer}>
              <Text style={styles.postButtonTitle}>Post a New Game</Text>
              <Text style={styles.postButtonSubtitle}>Create a game and invite players</Text>
            </View>
            <Text style={styles.postButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Games List */}
        <View style={styles.gamesSection}>
          {filteredGames.length === 0 ? (
            <EmptyState
              icon="🎮"
              title="No Games Available"
              description="There are no active games at the moment. Check back soon or create your own!"
            />
          ) : (
            filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onJoin={handleJoinGame}
                onLeave={handleLeaveGame}
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
  onJoin: (gameId: string) => void;
  onLeave: (gameId: string) => void;
  formatTime: (dateString: string, timeType: string) => string;
}

const GameCard: React.FC<GameCardProps> = ({ game, onJoin, onLeave, formatTime }) => {
  const isFull = (game.current_players ?? 0) >= game.max_players;
  const isConfirmed = game.status === 'confirmed';
  const timeString = formatTime(game.scheduled_time, game.time_type);

  return (
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

      {/* Action Button */}
      {game.is_joined ? (
        <TouchableOpacity
          style={[styles.gameButton, styles.gameButtonLeave]}
          onPress={() => onLeave(game.id)}
        >
          <Text style={styles.gameButtonTextLeave}>Leave Game</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.gameButton,
            isFull && styles.gameButtonDisabled,
          ]}
          onPress={() => onJoin(game.id)}
          disabled={isFull}
        >
          <Text style={styles.gameButtonText}>
            {isFull ? 'Game Full' : 'Join Game'}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
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
  // Filter Section
  filterSection: {
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
  },
  filterContent: {
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipIcon: {
    fontSize: 18,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  // Post Button Section
  postButtonSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    ...Shadows.medium,
  },
  postButtonIcon: {
    fontSize: 32,
  },
  postButtonTextContainer: {
    flex: 1,
  },
  postButtonTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  postButtonSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  postButtonArrow: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
  },
  // Games Section
  gamesSection: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  // Game Card
  gameCard: {
    marginBottom: Spacing.md,
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
  gameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  gameButtonDisabled: {
    backgroundColor: Colors.backgroundTertiary,
  },
  gameButtonLeave: {
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  gameButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  gameButtonTextLeave: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
});

