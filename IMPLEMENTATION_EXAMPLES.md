# SportNS – Implementation Examples

This document provides ready-to-use React Native code examples for implementing the redesigned screens.

---

## Table of Contents
1. [Enhanced Dashboard Screen](#1-enhanced-dashboard-screen)
2. [Redesigned Game Card Component](#2-redesigned-game-card-component)
3. [Sport Filter Component](#3-sport-filter-component)
4. [Post Game Wizard (Step 1)](#4-post-game-wizard-step-1-sport-selection)
5. [Enhanced Top Navigation](#5-enhanced-top-navigation)
6. [Profile Screen Redesign](#6-profile-screen-redesign)
7. [Loading States & Skeletons](#7-loading-states--skeletons)
8. [Toast Notifications](#8-toast-notifications)

---

## 1. Enhanced Dashboard Screen

```typescript
// apps/mobile/src/screens/DashboardScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { 
  TopNav, 
  Card, 
  EmptyState, 
  SportChip, 
  Button,
  GameCard,
  Skeleton,
} from '../components';
import { getActiveGames, joinGame, hasJoinedGame } from '../services/games';
import { getCurrentUser, getSports } from '../services/auth';
import type { GameEventWithDetails, Sport } from '../types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [games, setGames] = useState<GameEventWithDetails[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Animated values for screen entrance
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        loadGames();
      }
    }, [currentUserId])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        const [sportsData] = await Promise.all([
          getSports(),
        ]);
        
        setCurrentUserId(user.id);
        setSports(sportsData);
        await loadGames();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const gamesData = await getActiveGames();
      
      if (currentUserId) {
        const gamesWithJoinStatus = await Promise.all(
          gamesData.map(async (game) => {
            const joined = await hasJoinedGame(game.id, currentUserId);
            return { ...game, is_joined: joined };
          })
        );
        setGames(gamesWithJoinStatus);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleSportToggle = (sportId: number) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      } else {
        return [...prev, sportId];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedSports([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGames();
    setIsRefreshing(false);
  };

  const handlePostGame = () => {
    navigation.navigate('PostGame' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  // Filter games by selected sports
  const filteredGames = selectedSports.length > 0
    ? games.filter(game => selectedSports.includes(game.sport_id))
    : games;

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
        <ScrollView style={styles.scrollView}>
          <View style={styles.filterSection}>
            <Skeleton width="100%" height={40} />
          </View>
          <View style={styles.heroSection}>
            <Skeleton width="100%" height={100} borderRadius={BorderRadius.lg} />
          </View>
          <View style={styles.gamesSection}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} width="100%" height={150} borderRadius={BorderRadius.lg} style={{ marginBottom: Spacing.md }} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <TopNav 
        title="NS SPORTS"
        rightAction={{
          icon: '👤',
          onPress: handleProfilePress,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Sport Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter by Sport</Text>
            {selectedSports.length > 0 && (
              <Button
                title="Clear"
                variant="ghost"
                size="small"
                onPress={handleClearFilters}
              />
            )}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsContainer}
          >
            {sports.map((sport) => (
              <SportChip
                key={sport.id}
                icon={sport.icon || '🏃'}
                label={sport.name}
                isActive={selectedSports.includes(sport.id)}
                onPress={() => handleSportToggle(sport.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Post Game Hero Button */}
        <View style={styles.heroSection}>
          <HeroPostButton onPress={handlePostGame} />
        </View>

        {/* Games List */}
        <View style={styles.gamesSection}>
          <View style={styles.gamesSectionHeader}>
            <Text style={styles.gamesSectionTitle}>Active Games</Text>
            <Text style={styles.gamesSectionSubtitle}>
              {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} available
            </Text>
          </View>

          {filteredGames.length === 0 ? (
            <EmptyState
              icon="⚽"
              title="No Games Available"
              description={
                selectedSports.length > 0
                  ? "No games match your filters. Try adjusting your selection."
                  : "There are no active games right now. Be the first to post one!"
              }
              action={
                <Button
                  title="Post a Game"
                  onPress={handlePostGame}
                  icon="📢"
                />
              }
            />
          ) : (
            filteredGames.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                index={index}
                onPress={() => {
                  if (game.is_joined) {
                    navigation.navigate('GameDetail', { gameId: game.id } as never);
                  } else {
                    handleJoinGame(game.id);
                  }
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

// Hero Post Button Component
const HeroPostButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.heroButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.heroButtonIcon}>
          <Text style={styles.heroButtonIconText}>📢</Text>
        </View>
        <View style={styles.heroButtonContent}>
          <Text style={styles.heroButtonTitle}>Post a New Game</Text>
          <Text style={styles.heroButtonSubtitle}>Create and invite players</Text>
        </View>
        <Text style={styles.heroButtonArrow}>→</Text>
      </TouchableOpacity>
    </Animated.View>
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
  
  // Filter Section
  filterSection: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  filterTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  filterChipsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  
  // Hero Section
  heroSection: {
    padding: Spacing.lg,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  heroButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  heroButtonIconText: {
    fontSize: 32,
  },
  heroButtonContent: {
    flex: 1,
  },
  heroButtonTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  heroButtonSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  heroButtonArrow: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Games Section
  gamesSection: {
    padding: Spacing.lg,
  },
  gamesSectionHeader: {
    marginBottom: Spacing.lg,
  },
  gamesSectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xxs,
  },
  gamesSectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
```

---

## 2. Redesigned Game Card Component

```typescript
// apps/mobile/src/components/GameCard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import type { GameEventWithDetails } from '../types';
import { SKILL_LEVEL_LABELS } from '../types';

interface GameCardProps {
  game: GameEventWithDetails;
  index: number;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, index, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 50),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          from: 0.9,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
    }).start();
  };

  const isConfirmed = (game.current_players ?? 0) >= game.min_players;
  const isFull = (game.current_players ?? 0) >= game.max_players;
  const hasSkillRestrictions = game.skill_level_min || game.skill_level_max;

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[
          styles.card,
          game.is_joined && styles.cardJoined,
        ]}>
          {/* Status Badge (Top Right) */}
          <View style={styles.statusBadgeContainer}>
            {game.is_joined ? (
              <View style={[styles.statusBadge, styles.statusBadgeJoined]}>
                <Text style={styles.statusBadgeText}>✓ You're In</Text>
              </View>
            ) : isConfirmed ? (
              <View style={[styles.statusBadge, styles.statusBadgeConfirmed]}>
                <Text style={styles.statusBadgeText}>✓ Confirmed</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.statusBadgeWaiting]}>
                <Text style={styles.statusBadgeText}>Waiting</Text>
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={styles.cardContent}>
            {/* Sport Icon */}
            <View style={styles.sportIconContainer}>
              <Text style={styles.sportIcon}>{game.sport?.icon || '🏃'}</Text>
            </View>

            {/* Game Info */}
            <View style={styles.gameInfo}>
              <Text style={styles.sportName}>{game.sport?.name || 'Unknown Sport'}</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>⏰</Text>
                <Text style={styles.detailText}>
                  {formatGameTime(game.scheduled_time, game.time_type)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>👥</Text>
                <Text style={styles.detailText}>
                  {game.current_players ?? 0}/{game.max_players} players
                  {!isConfirmed && ` • needs ${game.min_players - (game.current_players ?? 0)} more`}
                </Text>
              </View>

              {hasSkillRestrictions && (
                <View style={styles.skillChip}>
                  <Text style={styles.skillChipIcon}>📊</Text>
                  <Text style={styles.skillChipText}>
                    {SKILL_LEVEL_LABELS[game.skill_level_min || 'beginner']} - {SKILL_LEVEL_LABELS[game.skill_level_max || 'expert']}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Hint */}
          {!game.is_joined && (
            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>
                {isFull ? 'Game is full' : 'Tap to join →'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper function
const formatGameTime = (dateString: string, timeType: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (timeType === 'now') {
    return 'Right now! 🏃‍♂️';
  }

  const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.round(diffInHours * 60);
    return `In ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
  }

  const isToday = date.toDateString() === now.toDateString();
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeString}`;
  }

  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardJoined: {
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    ...Shadows.md,
  },
  
  statusBadgeContainer: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusBadgeJoined: {
    backgroundColor: Colors.primary,
  },
  statusBadgeConfirmed: {
    backgroundColor: Colors.secondary,
  },
  statusBadgeWaiting: {
    backgroundColor: Colors.warning,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  
  sportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sportIcon: {
    fontSize: 36,
  },
  
  gameInfo: {
    flex: 1,
    paddingRight: Spacing.xl, // Space for status badge
  },
  sportName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
    width: 20,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
  },
  skillChipIcon: {
    fontSize: 12,
    marginRight: Spacing.xxs,
  },
  skillChipText: {
    fontSize: Typography.fontSize.xxs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.accentDark,
  },
  
  actionHint: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  actionHintText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
});
```

---

## 3. Sport Filter Component

```typescript
// apps/mobile/src/components/SportChip.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface SportChipProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const SportChip: React.FC<SportChipProps> = ({
  icon,
  label,
  isActive,
  onPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 5,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Text style={styles.chipIcon}>{icon}</Text>
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.xs,
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.textInverse,
  },
});
```

---

## 4. Post Game Wizard (Step 1: Sport Selection)

```typescript
// apps/mobile/src/screens/PostGameScreen/SportSelectionStep.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import type { Sport } from '../../types';

interface SportSelectionStepProps {
  sports: Sport[];
  selectedSportId: number | null;
  onSelectSport: (sportId: number) => void;
}

export const SportSelectionStep: React.FC<SportSelectionStepProps> = ({
  sports,
  selectedSportId,
  onSelectSport,
}) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Which sport?</Text>
        <Text style={styles.subtitle}>Tap to select your game type</Text>
      </View>

      {/* Sport Grid */}
      <View style={styles.grid}>
        {sports.map((sport) => (
          <SportCard
            key={sport.id}
            sport={sport}
            isSelected={selectedSportId === sport.id}
            onPress={() => onSelectSport(sport.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

// Sport Card Component
interface SportCardProps {
  sport: Sport;
  isSelected: boolean;
  onPress: () => void;
}

const SportCard: React.FC<SportCardProps> = ({ sport, isSelected, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSelected) {
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 80,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      tension: 80,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.sportCardContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.sportCard,
          isSelected && styles.sportCardSelected,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[
          styles.sportIconContainer,
          isSelected && styles.sportIconContainerSelected,
        ]}>
          <Text style={styles.sportIcon}>{sport.icon || '🏃'}</Text>
        </View>
        <Text style={[
          styles.sportName,
          isSelected && styles.sportNameSelected,
        ]}>
          {sport.name}
        </Text>
        
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  
  sportCardContainer: {
    width: '48%',
  },
  sportCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  sportCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
    ...Shadows.md,
  },
  
  sportIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  sportIconContainerSelected: {
    backgroundColor: Colors.primaryLight,
  },
  sportIcon: {
    fontSize: 48,
  },
  
  sportName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  sportNameSelected: {
    color: Colors.primary,
  },
  
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
  },
});
```

---

## 5. Enhanced Top Navigation

```typescript
// apps/mobile/src/components/TopNav.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';

interface TopNavProps {
  title: string;
  leftAction?: {
    icon: string;
    label?: string;
    onPress: () => void;
  };
  rightAction?: {
    icon: string;
    label?: string;
    onPress: () => void;
  };
  transparent?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  title,
  leftAction,
  rightAction,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm },
        !transparent && styles.containerSolid,
      ]}
    >
      {/* Left Action */}
      <View style={styles.actionContainer}>
        {leftAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={leftAction.onPress}
            activeOpacity={0.7}
          >
            {leftAction.label ? (
              <View style={styles.avatarButton}>
                <Text style={styles.avatarText}>{leftAction.label}</Text>
              </View>
            ) : (
              <Text style={styles.actionIcon}>{leftAction.icon}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right Action */}
      <View style={styles.actionContainer}>
        {rightAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            {rightAction.label ? (
              <View style={styles.avatarButton}>
                <Text style={styles.avatarText}>{rightAction.label}</Text>
              </View>
            ) : (
              <Text style={styles.actionIcon}>{rightAction.icon}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  containerSolid: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.xs,
  },
  
  title: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  actionContainer: {
    width: 48,
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.xs,
  },
  actionIcon: {
    fontSize: 24,
  },
  
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xs,
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
```

---

## 6. Profile Screen Redesign

```typescript
// apps/mobile/src/screens/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { Button, Card, Input } from '../components';
import { getCurrentUser, getProfile, signOut } from '../services/auth';
import type { Profile } from '../types';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigation will be handled by auth state change
          },
        },
      ]
    );
  };

  const getUserInitial = () => {
    return profile?.username?.charAt(0).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitial()}</Text>
            </View>
          </View>
          
          <Text style={styles.username}>{profile?.username || 'User'}</Text>
          <Text style={styles.joinDate}>
            Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {/* Settings Cards */}
        <View style={styles.settingsSection}>
          {/* Username Card */}
          <SettingCard
            icon="👤"
            title="Username"
            subtitle={profile?.username || 'Not set'}
            onPress={() => {
              // Navigate to username edit screen or show modal
              Alert.alert('Edit Username', 'This feature is coming soon!');
            }}
          />

          {/* Skills Card */}
          <SettingCard
            icon="⚡"
            title="Re-evaluate Skills"
            subtitle="Update your skill levels"
            onPress={() => navigation.navigate('ReEvaluateSkills' as never)}
          />

          {/* Notifications Card */}
          <SettingCard
            icon="🔔"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => navigation.navigate('NotificationSettings' as never)}
          />

          {/* Stats Card (Future) */}
          <SettingCard
            icon="📊"
            title="Your Stats"
            subtitle="Coming soon"
            onPress={() => {
              Alert.alert('Coming Soon', 'Stats feature will be available soon!');
            }}
            disabled
          />

          {/* Logout Card */}
          <SettingCard
            icon="🚪"
            title="Log Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            destructive
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Setting Card Component
interface SettingCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

const SettingCard: React.FC<SettingCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.settingCard, disabled && styles.settingCardDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.settingIconContainer}>
        <Text style={styles.settingIcon}>{icon}</Text>
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          destructive && styles.settingTitleDestructive,
        ]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      
      <Text style={styles.settingArrow}>→</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    backgroundColor: Colors.primarySurface,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  username: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  joinDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  
  // Settings Section
  settingsSection: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingCardDisabled: {
    opacity: 0.5,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xxs,
  },
  settingTitleDestructive: {
    color: Colors.error,
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  settingArrow: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
});
```

---

## 7. Loading States & Skeletons

```typescript
// apps/mobile/src/components/Skeleton.tsx

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.borderLight,
  },
});

// Game Card Skeleton
export const GameCardSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.header}>
        <Skeleton width={64} height={64} borderRadius={BorderRadius.full} />
        <View style={skeletonStyles.info}>
          <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height={14} style={{ marginBottom: 4 }} />
          <Skeleton width="70%" height={14} />
        </View>
      </View>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
```

---

## 8. Toast Notifications

```typescript
// apps/mobile/src/components/Toast.tsx

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.secondary;
      case 'error':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + Spacing.md,
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    borderRadius: BorderRadius.md,
    ...Shadows.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 18,
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.bold,
  },
  message: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textInverse,
  },
});

// Toast Manager Hook
import { useState, useCallback } from 'react';

interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastConfig & { id: number }>>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...config, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
};
```

---

## Usage Example in App.tsx

```typescript
// apps/mobile/App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { useToast } from './src/components/Toast';

export default function App() {
  const { showToast, ToastContainer } = useToast();

  // Example: Show toast when game is joined
  const handleGameJoined = () => {
    showToast({
      message: 'Successfully joined the game!',
      type: 'success',
      duration: 3000,
    });
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <HomeScreen />
        <ToastContainer />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

---

## Installation Commands

```bash
# Navigate to mobile app directory
cd apps/mobile

# Install recommended icon library
npm install lucide-react-native

# Install Lottie for animations (optional)
npm install lottie-react-native

# If using React Native Paper (optional)
npm install react-native-paper

# Rebuild
npm run android
# or
npm run ios
```

---

## Next Steps

1. **Update Theme File**: Replace `apps/mobile/src/theme/index.ts` with the new color palette
2. **Create Component Library**: Add all the components from this document to `apps/mobile/src/components/`
3. **Implement Screens Incrementally**: Start with Dashboard, then Post Game, then others
4. **Test on Device**: Ensure animations perform well on real devices
5. **Gather Feedback**: Test with users and iterate

---

This implementation guide provides production-ready code for your redesigned app. All components follow React Native best practices and are optimized for performance with native animations.

