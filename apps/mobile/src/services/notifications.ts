import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import type { NotificationSettings } from '../types';

/**
 * Notification service for push notifications and notification settings
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
  handleSuccess: (notificationId) => {
    console.log('Notification handled successfully:', notificationId);
  },
  handleError: (notificationId, error) => {
    console.warn('Notification failed:', notificationId, error);
  },
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.warn('Could not set notification channel:', error);
    }
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    // Check if we're in Expo Go by trying to detect the environment
    // In Expo Go, Constants.executionEnvironment will be 'storeClient'
    const isExpoGo = Constants.executionEnvironment === 'storeClient';

    if (isExpoGo) {
      console.info('ℹ️ Running in Expo Go - push notifications require development build');
      console.info('✅ Local notifications will still work perfectly');
      return null;
    }

    // Try to get Expo push token (only in development builds)
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    } catch (error) {
      console.warn('Could not get Expo push token:', error);
      console.info('This may indicate missing EAS project configuration.');
      console.info('For push notifications, ensure you have:');
      console.info('1. EAS project configured (run: eas build:configure)');
      console.info('2. Development build installed');
      // Return null but don't throw - local notifications will still work
      return null;
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
};

export const savePushToken = async (userId: string, token: string | null) => {
  // Only save if we have a valid token
  if (!token) {
    console.info('No push token to save - local notifications will still work');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId);

  if (error) throw error;
};

/**
 * Get user's notification settings
 */
export const getNotificationSettings = async (userId: string): Promise<NotificationSettings> => {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If settings don't exist, create default settings
    if (error.code === 'PGRST116') {
      return createDefaultNotificationSettings(userId);
    }
    throw error;
  }

  return data;
};

/**
 * Create default notification settings for a user
 */
export const createDefaultNotificationSettings = async (userId: string): Promise<NotificationSettings> => {
  const { data, error } = await supabase
    .from('notification_settings')
    .insert({
      user_id: userId,
      notify_30min_before_game: true,
      notify_5min_before_game: true,
      notify_new_chat_message: true,
      notify_player_joins_game: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  userId: string,
  settings: Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<NotificationSettings> => {
  const { data, error } = await supabase
    .from('notification_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Schedule a local notification (for immediate notifications)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>,
  delaySeconds: number = 0
) => {
  try {
    console.log('📱 Scheduling notification:', { title, body, delaySeconds });
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, 
        seconds: delaySeconds, 
        repeats: false 
      } : null,
    });
    
    console.log('✅ Notification scheduled with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Failed to schedule notification:', error);
    throw error;
  }
};

/**
 * Create a game reminder notification
 */
export const scheduleGameReminder = async (
  gameId: string,
  gameTitle: string,
  minutesUntil: number
) => {
  const title = 'Game Reminder';
  const body = `${gameTitle} starts in ${minutesUntil} minutes`;

  await scheduleLocalNotification(title, body, {
    type: 'game_reminder',
    game_id: gameId,
    minutes_until: minutesUntil,
  });
};

/**
 * Create a player joined notification
 */
export const schedulePlayerJoinedNotification = async (
  gameId: string,
  gameTitle: string,
  playerName: string
) => {
  const title = 'Player Joined';
  const body = `${playerName} joined ${gameTitle}`;

  await scheduleLocalNotification(title, body, {
    type: 'player_joined',
    game_id: gameId,
    player_name: playerName,
  });
};

/**
 * Create a chat message notification
 */
export const scheduleChatMessageNotification = async (
  gameId: string,
  _gameTitle: string,
  senderName: string,
  message: string
) => {
  const title = 'New Message';
  const body = `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`;

  await scheduleLocalNotification(title, body, {
    type: 'chat_message',
    game_id: gameId,
    sender_name: senderName,
    message: message,
  });
};

/**
 * Send a push notification via Expo Push API (this would typically be done server-side)
 * For now, we'll use local notifications
 */
export const sendPushNotification = async (
  _expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  // In production, this would be handled by a backend service
  // For now, we'll trigger a local notification
  await scheduleLocalNotification(title, body, data);
};

/**
 * Listen for notification responses (when user taps on a notification)
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Listen for notifications received while app is in foreground
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

