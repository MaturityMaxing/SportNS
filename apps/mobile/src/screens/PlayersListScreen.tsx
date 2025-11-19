import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav } from '../components';
import { getGameById } from '../services/games';
import type { GameEventWithDetails, Profile } from '../types';

type PlayersListRouteParams = {
  PlayersList: {
    gameId: string;
  };
};

/**
 * PlayersListScreen - Full screen displaying all players in a game
 */
export const PlayersListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PlayersListRouteParams, 'PlayersList'>>();
  const { gameId } = route.params;

  const [game, setGame] = useState<GameEventWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = async () => {
    try {
      setIsLoading(true);
      const gameData = await getGameById(gameId);
      
      if (!gameData) {
        Alert.alert('Error', 'Game not found', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
        return;
      }

      setGame(gameData);
    } catch (error) {
      console.error('Error loading game:', error);
      Alert.alert('Error', 'Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGame();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <TopNav
        title={`Players (${game?.current_players || 0})`}
        centered
        leftAction={{
          icon: '←',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.playersList}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading players...</Text>
          ) : game?.participants && game.participants.length > 0 ? (
            game.participants.map((player: Profile) => (
              <View key={player.id} style={styles.playerItem}>
                <View style={styles.playerAvatar}>
                  <Text style={styles.playerAvatarText}>
                    {(player.username || player.discord_username || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {player.username || player.discord_username || 'Unknown'}
                  </Text>
                  {player.id === game?.creator_id && (
                    <View style={styles.creatorBadge}>
                      <Text style={styles.creatorBadgeText}>👑 Creator</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noPlayersText}>No players yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
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
  playersList: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  creatorBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  creatorBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDark,
  },
  noPlayersText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});

