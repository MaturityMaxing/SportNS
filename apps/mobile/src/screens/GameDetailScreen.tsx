import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card, EmptyState } from '../components';
import {
  getGameById,
  leaveGame,
  endGame,
  generateShareText,
  getGameChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
  subscribeToParticipantUpdates,
} from '../services/games';
import { getCurrentUser } from '../services/auth';
import type { GameEventWithDetails, GameChatMessageWithSender, Profile } from '../types';
import { SKILL_LEVEL_LABELS } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type GameDetailRouteParams = {
  GameDetail: {
    gameId: string;
  };
};

/**
 * GameDetailScreen - Detailed view of a game with chat and actions
 */
export const GameDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<GameDetailRouteParams, 'GameDetail'>>();
  const { gameId } = route.params;

  const [game, setGame] = useState<GameEventWithDetails | null>(null);
  const [messages, setMessages] = useState<GameChatMessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [endGameCountdown, setEndGameCountdown] = useState<number>(5);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  const chatChannelRef = useRef<RealtimeChannel | null>(null);
  const participantChannelRef = useRef<RealtimeChannel | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const chatScrollViewRef = useRef<ScrollView | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();

    return () => {
      // Cleanup subscriptions
      if (chatChannelRef.current) {
        chatChannelRef.current.unsubscribe();
      }
      if (participantChannelRef.current) {
        participantChannelRef.current.unsubscribe();
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [gameId]);

  useEffect(() => {
    // Setup real-time subscriptions after initial load
    if (game && currentUserId) {
      setupRealtimeSubscriptions();
    }
  }, [game?.id, currentUserId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in');
        navigation.goBack();
        return;
      }

      setCurrentUserId(user.id);

      const [gameData, chatData] = await Promise.all([
        getGameById(gameId),
        getGameChatMessages(gameId),
      ]);

      if (!gameData) {
        Alert.alert('Error', 'Game not found');
        navigation.goBack();
        return;
      }

      setGame(gameData);
      setMessages(chatData);

      // Scroll chat to bottom after messages load
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading game details:', error);
      Alert.alert('Error', 'Failed to load game details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to chat messages
    chatChannelRef.current = subscribeToChatMessages(gameId, (message) => {
      setMessages((prev) => [...prev, message]);
      // Scroll both the main scroll view and the chat scroll view
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Subscribe to participant updates
    participantChannelRef.current = subscribeToParticipantUpdates(gameId, async () => {
      const updatedGame = await getGameById(gameId);
      if (updatedGame) {
        setGame(updatedGame);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      await sendChatMessage(gameId, currentUserId, messageText);
      // Message will appear via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleLeaveGame = async () => {
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
              navigation.goBack();
            } catch (error) {
              console.error('Error leaving game:', error);
              Alert.alert('Error', 'Failed to leave game');
            }
          },
        },
      ]
    );
  };

  const handleEndGame = () => {
    setEndGameCountdown(5);
    setShowEndGameModal(true);

    // Start countdown timer
    countdownTimerRef.current = setInterval(() => {
      setEndGameCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 0; // Button becomes enabled
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelEndGame = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setEndGameCountdown(5);
    setShowEndGameModal(false);
  };

  const performEndGame = async () => {
    // Don't allow if countdown hasn't finished
    if (endGameCountdown > 0) {
      return;
    }

    // Clean up timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setShowEndGameModal(false);
    setEndGameCountdown(5);

    try {
      await endGame(gameId);
      Alert.alert('Game Ended', 'The game has been marked as completed', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('Error', 'Failed to end game');
    }
  };

  const handleShareGame = async () => {
    if (!game) return;

    try {
      const shareText = generateShareText(game);
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing game:', error);
    }
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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopNav
          title="Game Details"
          centered
          leftAction={{
            icon: '←',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading game details...</Text>
        </View>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.container}>
        <TopNav
          title="Game Details"
          centered
          leftAction={{
            icon: '←',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <EmptyState
            icon="❌"
            title="Game Not Found"
            description="This game may have been deleted"
          />
        </View>
      </View>
    );
  }

  const isConfirmed = game.status === 'confirmed';

  return (
    <View style={styles.container}>
      <TopNav
        title="Game Details"
        centered
        leftAction={{
          icon: '←',
          onPress: () => navigation.goBack(),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
        {/* Game Info Section */}
        <Card style={styles.gameInfoCard}>
          <View style={styles.gameHeader}>
            <View style={styles.gameTitleRow}>
              <Text style={styles.sportIcon}>{game.sport?.icon || '🏃'}</Text>
              <View style={styles.gameTitleContent}>
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

          <View style={styles.gameDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⏰</Text>
              <Text style={styles.detailText}>{formatTime(game.scheduled_time, game.time_type)}</Text>
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

          {/* Action Buttons in Game Info */}
          <View style={styles.infoActionsRow}>
            <TouchableOpacity 
              style={styles.infoActionButton}
              onPress={handleShareGame}
            >
              <Text style={styles.infoActionIcon}>📤</Text>
              <Text style={styles.infoActionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoActionButton}
              onPress={() => setShowPlayersModal(true)}
            >
              <Text style={styles.infoActionIcon}>👥</Text>
              <Text style={styles.infoActionText}>
                Players ({game.current_players})
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Chat Section */}
        <Card style={styles.chatCard}>
          <Text style={styles.sectionTitle}>Chat</Text>

          <ScrollView
            ref={chatScrollViewRef}
            style={styles.chatMessagesScroll}
            contentContainerStyle={styles.chatMessages}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {messages.length === 0 ? (
              <Text style={styles.noChatText}>No messages yet. Start the conversation!</Text>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.sender_id === currentUserId;
                return (
                  <View
                    key={msg.id}
                    style={[styles.chatMessage, isOwnMessage && styles.chatMessageOwn]}
                  >
                    <View style={styles.chatMessageHeader}>
                      <Text style={[styles.chatMessageSender, isOwnMessage && styles.chatMessageSenderOwn]}>
                        {msg.sender_username}
                      </Text>
                      <Text style={[styles.chatMessageTime, isOwnMessage && styles.chatMessageTimeOwn]}>
                        {formatMessageTime(msg.created_at)}
                      </Text>
                    </View>
                    <Text style={[styles.chatMessageText, isOwnMessage && styles.chatMessageTextOwn]}>
                      {msg.message}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Chat Input - Connected to chat box */}
          <View style={styles.chatInputWrapper}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textSecondary}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              onFocus={() => {
                // Scroll to bottom when focusing input
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator color={Colors.textInverse} size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Action Buttons at Bottom */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleLeaveGame}
          >
            <Text style={styles.actionButtonIcon}>🚪</Text>
            <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Leave Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonWarning]}
            onPress={handleEndGame}
          >
            <Text style={styles.actionButtonIcon}>🏁</Text>
            <Text style={[styles.actionButtonText, styles.actionButtonTextWarning]}>End Game</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Players List Modal */}
      <Modal
        visible={showPlayersModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPlayersModal(false)}
      >
        <View style={styles.playersModalContainer}>
          <View style={styles.playersModalHeader}>
            <TouchableOpacity onPress={() => setShowPlayersModal(false)}>
              <Text style={styles.playersModalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.playersModalHeaderTitle}>
              Players ({game?.current_players || 0})
            </Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.playersModalScroll} showsVerticalScrollIndicator={true}>
            <View style={styles.playersModalList}>
              {game?.participants && game.participants.length > 0 ? (
                game.participants.map((player: Profile) => (
                  <View key={player.id} style={styles.playersModalItem}>
                    <View style={styles.playersModalAvatar}>
                      <Text style={styles.playersModalAvatarText}>
                        {(player.username || player.discord_username || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.playersModalInfo}>
                      <Text style={styles.playersModalName}>
                        {player.username || player.discord_username || 'Unknown'}
                      </Text>
                      {player.id === game?.creator_id && (
                        <View style={styles.playersModalCreatorBadge}>
                          <Text style={styles.playersModalCreatorBadgeText}>👑 Creator</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.playersModalNoPlayers}>No players yet</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* End Game Confirmation Modal */}
      <Modal
        visible={showEndGameModal}
        transparent
        animationType="fade"
        onRequestClose={cancelEndGame}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Game</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to end this game? This will mark the game as completed for all participants.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelEndGame}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonEnd,
                  endGameCountdown > 0 && styles.modalButtonDisabled
                ]}
                onPress={performEndGame}
                disabled={endGameCountdown > 0}
              >
                <Text style={[
                  styles.modalButtonTextEnd,
                  endGameCountdown > 0 && styles.modalButtonTextDisabled
                ]}>
                  {endGameCountdown > 0 ? `End Game (${endGameCountdown}s)` : 'End Game'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
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
  // Game Info
  gameInfoCard: {
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
  gameTitleContent: {
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
  infoActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoActionIcon: {
    fontSize: 18,
  },
  infoActionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
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
  // Players List Card
  playersCard: {
    marginBottom: Spacing.md,
  },
  playersButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  playersButtonIcon: {
    fontSize: 32,
  },
  playersButtonTextContainer: {
    flex: 1,
  },
  playersButtonTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  playersButtonSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  playersButtonArrow: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  // Players Modal
  playersModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  playersModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  playersModalHeaderTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  playersModalCloseButton: {
    fontSize: Typography.fontSize.xxxl,
    color: Colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  playersModalScroll: {
    flex: 1,
  },
  playersModalList: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  playersModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  playersModalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playersModalAvatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  playersModalInfo: {
    flex: 1,
  },
  playersModalName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  playersModalCreatorBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  playersModalCreatorBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDark,
  },
  playersModalNoPlayers: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  // Actions
  actionsSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  actionButtonDanger: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  actionButtonWarning: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  actionButtonTextDanger: {
    color: Colors.error,
  },
  actionButtonTextWarning: {
    color: '#FFA500',
  },
  // Chat
  chatCard: {
    marginBottom: Spacing.md,
  },
  chatMessagesScroll: {
    maxHeight: 300,
    marginBottom: Spacing.md,
  },
  chatMessages: {
    gap: Spacing.sm,
    paddingRight: Spacing.xs, // Space for scrollbar
  },
  noChatText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  chatMessage: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    maxWidth: '80%',
  },
  chatMessageOwn: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  chatMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chatMessageSender: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text, // Default for other messages
  },
  chatMessageSenderOwn: {
    color: Colors.textInverse, // White for own messages
  },
  chatMessageTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary, // Default for other messages
  },
  chatMessageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.8)', // Light for own messages
  },
  chatMessageText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text, // Default for other messages
  },
  chatMessageTextOwn: {
    color: Colors.textInverse, // White for own messages
  },
  // Chat Input (inside card)
  chatInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundTertiary,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.backgroundTertiary,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: '#666666', // Medium gray for better contrast with white text
    opacity: 1, // Remove opacity so text is fully visible
  },
  sendButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF', // White text
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonEnd: {
    backgroundColor: Colors.error,
  },
  modalButtonDisabled: {
    backgroundColor: Colors.backgroundTertiary,
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  modalButtonTextEnd: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  modalButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});

