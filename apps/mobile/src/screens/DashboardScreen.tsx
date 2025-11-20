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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Megaphone, Clock, Users, BarChart3, Check, Sparkles, AlertTriangle, Activity, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card, EmptyState, SportIcon } from '../components';
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
  const insets = useSafeAreaInsets();
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
      // Note: Reminders are now handled server-side via Supabase Edge Functions
      try {
        console.log('Game reminders will be sent via server push notifications');
        // Client-side scheduling removed to avoid duplicates
      } catch (notifError) {
        console.error('❌ Failed to log reminder info:', notifError);
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
          icon: User,
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
          label: getUserInitial(),
          onPress: handleProfilePress,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Sport Filter - Multiple Selection */}
        <View style={styles.filterSection}>
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
                All
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
                <SportIcon 
                  sport={sport} 
                  size={20} 
                  color={selectedSports.includes(sport.id) ? Colors.textInverse : Colors.textSecondary}
                />
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

        {/* Games List */}
        {filteredGames.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon={Activity}
              title="No Games Available"
              description="There are no active games at the moment. Check back soon or create your own!"
            />
          </View>
        ) : (
          <View style={styles.gamesSection}>
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onJoin={handleJoinGame}
                onLeave={handleLeaveGame}
                formatTime={formatTime}
                isSkillMatch={isGameSkillMatch(game)}
                userSkills={userSkills}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Post Game Button - Fixed at Bottom */}
      <View style={[styles.postButtonFixed, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <TouchableOpacity 
          style={styles.postButton}
          onPress={handlePostGame}
          activeOpacity={0.85}
        >
          <View style={styles.postButtonIconContainer}>
            <Megaphone size={24} color={Colors.textInverse} strokeWidth={2} />
          </View>
          <View style={styles.postButtonTextContainer}>
            <Text style={styles.postButtonTitle}>Post a New Game</Text>
            <Text style={styles.postButtonSubtitle}>Create a game and invite players</Text>
          </View>
          <View style={styles.postButtonArrowContainer}>
            <ChevronRight size={20} color={Colors.textInverse} strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </View>
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
            <Sparkles size={14} color={Colors.primaryDark} strokeWidth={2} />
            <Text style={styles.skillMatchBadgeText}>Perfect Match for Your Level</Text>
          </View>
        )}

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
                    return `${current}/${max} Confirmed`;
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
          </View>
          
          {/* Joined indicator */}
          {game.is_joined && (
            <View style={styles.joinedIndicator}>
              <Check size={14} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.joinedIndicatorText}>Joined</Text>
            </View>
          )}
        </View>

        {/* Action Button - Only show if not joined */}
        {!game.is_joined && (
          <>
            {!isUserEligible ? (
              <View style={[styles.gameButton, styles.gameButtonDisabled]}>
                <AlertTriangle size={16} color={Colors.textSecondary} strokeWidth={2} />
                <Text style={styles.gameButtonText}>
                  Your skill level doesn't match this game
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
                activeOpacity={0.85}
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
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  // Filter Section
  filterSection: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 32,
    gap: Spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  // Post Button Section - Fixed at Bottom
  postButtonFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  postButtonIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonTextContainer: {
    flex: 1,
  },
  postButtonTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  postButtonSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  postButtonArrowContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  joinedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
    alignSelf: 'flex-start',
  },
  joinedIndicatorText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
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
  detailText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  gameButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    ...Shadows.small,
  },
  gameButtonDisabled: {
    backgroundColor: Colors.backgroundTertiary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  gameButtonInGame: {
    backgroundColor: Colors.available,
    borderWidth: 2,
    borderColor: Colors.available,
  },
  gameButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  gameButtonTextInGame: {
    fontFamily: Typography.fontFamily.semibold,
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
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  skillFilterSubtitle: {
    fontFamily: Typography.fontFamily.regular,
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
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  // Skill Match Badge
  skillMatchBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  skillMatchBadgeText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  gameCardSkillMatch: {
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.small,
  },
});

