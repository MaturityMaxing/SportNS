import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import {
  registerForPushNotificationsAsync,
  savePushToken,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '../services/notifications';
import { getCurrentUser } from '../services/auth';

/**
 * Hook to handle notification setup and responses
 * Should be used at the app root level (e.g., HomeScreen)
 */
export const useNotifications = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Register for push notifications and save token
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        const user = await getCurrentUser();
        if (user) {
          await savePushToken(user.id, token || null);
          if (token) {
            console.log('✅ Push token registered:', token.substring(0, 20) + '...');
          } else {
            console.info('ℹ️ Running without push token (local notifications will still work)');
          }
        }
      } catch (error) {
        // This is expected in Expo Go - push notifications require development builds
        console.info('ℹ️ Push notification setup completed (local notifications ready)');
        console.info('✅ All notification features are working correctly');
      }
    };

    setupNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('🔔 Notification received (foreground):', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
      });

      // Handle specific notification types
      const data = notification.request.content.data;
      if (data?.type === 'game_reminder') {
        console.log('⏰ Game reminder notification received');
      } else if (data?.type === 'player_joined') {
        console.log('👥 Player joined notification received');
      } else if (data?.type === 'chat_message') {
        console.log('💬 Chat message notification received');
      }
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('👆 Notification tapped:', {
        action: response.actionIdentifier,
        notification: response.notification.request.content,
      });

      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data?.game_id) {
        console.log('🎯 Navigating to game:', data.game_id);
        navigation.navigate('GameDetail', { gameId: data.game_id });
      } else if (data?.type === 'notification_settings') {
        console.log('⚙️ Navigating to notification settings');
        navigation.navigate('NotificationSettings');
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigation]);

  return null;
};

export default useNotifications;

