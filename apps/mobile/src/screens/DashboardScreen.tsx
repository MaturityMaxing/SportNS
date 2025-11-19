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
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card, EmptyState } from '../components';
import { 
  getActiveGames, 
  joinGame, 
  leaveGame, 
  hasJoinedGame,
  subscribeToGameUpdates,
  unsubscribeFromGameUpdates,
  triggerAutoEndOldGames,
} from '../services/games';
import { getCurrentUser, getProfile, getSkillLevels } from '../services/auth';
import { getSports } from '../services/auth';
import {
  getNotificationSettings,
  scheduleLocalNotification,
} from '../services/notifications';
import type { GameEventWithDetails, Sport, Profile, PlayerSkillLevel } from '../types';
import { SKILL_LEVEL_LABELS, SKILL_LEVELS } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * DashboardScreen - Display active game events
 * Shows list of available games with filtering by sport
 */
export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [games, setGames] = useState<GameEventWithDetails[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSkills, setUserSkills] = useState<PlayerSkillLevel[]>([]);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    loadData();
    
    // Setup real-time subscriptions
    const channel = subscribeToGameUpdates(() => {
      console.log('Dashboard: Game update detected, reloading games...');
      // Reload games when there are changes (INSERT, UPDATE, DELETE)
      loadGames();
    });
    realtimeChannelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (realtimeChannelRef.current) {
        unsubscribeFromGameUpdates(realtimeChannelRef.current);
      }
    };
  }, []);

  // Reload games when screen comes into focus (e.g., navigating back from PostGame)
  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        // Trigger auto-end for old games when screen comes into focus
        triggerAutoEndOldGames();
        loadGames();
      }
    }, [currentUserId])
  );

  useEffect(() => {
    if (!isLoading) {
      loadGames();
    }
  }, [selectedSports]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Trigger auto-end for old games (fallback if cron isn't running)
      // This runs in the background and doesn't block the UI
      triggerAutoEndOldGames();
      
      const user = await getCurrentUser();
      
      if (user) {
        const [profileData, sportsData, skillsData] = await Promise.all([
          getProfile(user.id),
          getSports(),
          getSkillLevels(user.id),
        ]);
        
        setCurrentUserId(user.id);
        setProfile(profileData);
        setSports(sportsData);
        setUserSkills(skillsData);
        
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
      // Load all games, we'll filter on frontend
      const gamesData = await getActiveGames();
      
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

  const handleSportToggle = (sportId: number) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        // Remove if already selected
        return prev.filter(id => id !== sportId);
      } else {
        // Add if not selected
        return [...prev, sportId];
      }
    });
  };

  const handleAllSportsToggle = () => {
    if (selectedSports.length === 0) {
      // Already showing all, do nothing (or could select all)
      return;
    } else {
      // Clear selection to show all
      setSelectedSports([]);
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

      // Schedule game reminders
      try {
        console.log('⏰ Scheduling game reminders...');
        const settings = await getNotificationSettings(currentUserId);
        console.log('⚙️ Notification settings:', settings);
        
        const game = games.find(g => g.id === gameId);
        if (game) {
          const scheduledTime = new Date(game.scheduled_time);
          const now = new Date();
          const sportName = game.sport?.name || 'game';
          
          console.log('🕐 Game time:', scheduledTime.toLocaleString());
          console.log('🕐 Current time:', now.toLocaleString());

          // Schedule 30-minute reminder
          if (settings?.notify_30min_before_game) {
            const notifyTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
            const secondsUntil = (notifyTime.getTime() - now.getTime()) / 1000;
            console.log('⏰ 30min reminder in', secondsUntil, 'seconds');
            
            if (secondsUntil > 0) {
              await scheduleLocalNotification(
                'Game Reminder',
                `Your ${sportName} game starts in 30 minutes`,
                { type: 'game_reminder', game_id: gameId, minutes_until: 30 },
                secondsUntil
              );
            } else {
              console.log('⏰ 30min reminder time already passed');
            }
          } else {
            console.log('🔕 30min reminders disabled');
          }

          // Schedule 5-minute reminder
          if (settings?.notify_5min_before_game) {
            const notifyTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
            const secondsUntil = (notifyTime.getTime() - now.getTime()) / 1000;
            console.log('⏰ 5min reminder in', secondsUntil, 'seconds');
            
            if (secondsUntil > 0) {
              await scheduleLocalNotification(
                'Game Reminder',
                `Your ${sportName} game starts in 5 minutes`,
                { type: 'game_reminder', game_id: gameId, minutes_until: 5 },
                secondsUntil
              );
            } else {
              console.log('⏰ 5min reminder time already passed');
            }
          } else {
            console.log('🔕 5min reminders disabled');
          }
        }
      } catch (notifError) {
        console.error('❌ Failed to schedule game reminders:', notifError);
        // Don't show error to user - reminders are optional
      }
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

  // Check if user's skill level matches game requirements
  const isGameSkillMatch = (game: GameEventWithDetails): boolean => {
    if (!game.skill_level_min && !game.skill_level_max) {
      // No skill requirements - always match
      return true;
    }

    // Find user's skill for this sport
    const userSkillForSport = userSkills.find(s => s.sport_id === game.sport_id);
    if (!userSkillForSport) {
      // User hasn't evaluated this sport - don't filter out
      return true;
    }

    const userSkillIndex = SKILL_LEVELS.indexOf(userSkillForSport.skill_level);
    const minSkillIndex = game.skill_level_min ? SKILL_LEVELS.indexOf(game.skill_level_min) : 0;
    const maxSkillIndex = game.skill_level_max ? SKILL_LEVELS.indexOf(game.skill_level_max) : SKILL_LEVELS.length - 1;

    return userSkillIndex >= minSkillIndex && userSkillIndex <= maxSkillIndex;
  };

  // Apply filters
  let filteredGames = games;

  // Filter by sport (multiple selection)
  if (selectedSports.length > 0) {
    filteredGames = filteredGames.filter(game => selectedSports.includes(game.sport_id));
  }

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
        {/* Sport Filter - Multiple Selection */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Sport (select multiple)</Text>
          <View style={styles.filterGrid}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSports.length === 0 && styles.filterChipActive,
              ]}
              onPress={handleAllSportsToggle}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSports.length === 0 && styles.filterChipTextActive,
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
                  selectedSports.includes(sport.id) && styles.filterChipActive,
                ]}
                onPress={() => handleSportToggle(sport.id)}
              >
                <Text style={styles.filterChipIcon}>{sport.icon || '🏃'}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSports.includes(sport.id) && styles.filterChipTextActive,
                  ]}
                >
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            icon="⚽"
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
                isSkillMatch={isGameSkillMatch(game)}
                userSkills={userSkills}
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
  isSkillMatch: boolean;
  userSkills: PlayerSkillLevel[];
}

const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  onJoin, 
  formatTime, 
  isSkillMatch,
  userSkills 
}) => {
  const navigation = useNavigation();
  const isFull = (game.current_players ?? 0) >= game.max_players;
  const timeString = formatTime(game.scheduled_time, game.time_type);
  
  // Get user's skill for this sport
  const userSkillForSport = userSkills.find(s => s.sport_id === game.sport_id);
  const hasSkillRequirements = game.skill_level_min || game.skill_level_max;
  
  // Check if user is eligible based on skill level
  const isUserEligible = !hasSkillRequirements || isSkillMatch;

  const handleCardPress = () => {
    if (game.is_joined) {
      // Navigate to game details if user is in the game
      (navigation as any).navigate('GameDetail', { gameId: game.id });
    } else if (isUserEligible && !isFull) {
      // Join game if eligible and not full
      onJoin(game.id);
    }
    // If not eligible or full, do nothing (card not clickable)
  };

  return (
    <TouchableOpacity
      activeOpacity={game.is_joined || (isUserEligible && !isFull) ? 0.7 : 1}
      onPress={handleCardPress}
      disabled={!game.is_joined && (!isUserEligible || isFull)}
    >
      <Card style={[styles.gameCard, isSkillMatch && hasSkillRequirements && styles.gameCardSkillMatch]}>
        {/* Skill Match Badge */}
        {isSkillMatch && hasSkillRequirements && userSkillForSport && (
          <View style={styles.skillMatchBadge}>
            <Text style={styles.skillMatchBadgeText}>✨ Perfect Match for Your Level</Text>
          </View>
        )}

        {/* Header - Minimal */}
        <View style={styles.gameHeader}>
          <Text style={styles.sportIcon}>{game.sport?.icon || '🏃'}</Text>
          <View style={styles.gameInfoCompact}>
            {/* Sport Name */}
            <Text style={styles.sportName}>{game.sport?.name || 'Unknown Sport'}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⏰</Text>
              <Text style={styles.detailText}>{timeString}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>
                {(() => {
                  const current = game.current_players ?? 0;
                  const max = game.max_players;
                  const min = game.min_players;
                  const isConfirmed = current >= min;
                  
                  if (isConfirmed) {
                    return `${current}/${max} ✓ Confirmed`;
                  } else {
                    const needed = min - current;
                    return `${current}/${max} (needs ${needed} more)`;
                  }
                })()}
              </Text>
            </View>
            {(game.skill_level_min || game.skill_level_max) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📊</Text>
                <Text style={styles.detailText}>
                  {game.skill_level_min ? SKILL_LEVEL_LABELS[game.skill_level_min] : 'Any'} 
                  {' - '} 
                  {game.skill_level_max ? SKILL_LEVEL_LABELS[game.skill_level_max] : 'Any'}
                </Text>
              </View>
            )}
          </View>
          
          {/* Green checkmark if user is in the game */}
          {game.is_joined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedCheckmark}>✓</Text>
            </View>
          )}
        </View>

        {/* Action Button - Only show if not joined */}
        {!game.is_joined && (
          <>
            {!isUserEligible ? (
              <View style={[styles.gameButton, styles.gameButtonDisabled]}>
                <Text style={styles.gameButtonText}>
                  ⚠️ Your skill level doesn't match this game
                </Text>
              </View>
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
          </>
        )}
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
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    minWidth: '30%',
    maxWidth: '32%',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipIcon: {
    fontSize: 16,
  },
  filterChipText: {
    fontSize: Typography.fontSize.xs,
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
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  gameInfoCompact: {
    flex: 1,
    gap: Spacing.xs,
  },
  sportIcon: {
    fontSize: 40,
  },
  sportName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  joinedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  joinedCheckmark: {
    fontSize: 20,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
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
  gameButtonInGame: {
    backgroundColor: Colors.available,
    borderWidth: 2,
    borderColor: Colors.available,
  },
  gameButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  gameButtonTextInGame: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  // Skill Filtering Section
  skillFilterSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  skillFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillFilterTitleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  skillFilterTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  skillFilterSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  skillFilterInfo: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  skillFilterInfoText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  // Skill Match Badge
  skillMatchBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  skillMatchBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  gameCardSkillMatch: {
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.medium,
  },
});

