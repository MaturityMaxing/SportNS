import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { getCurrentUser } from '../services/auth';
import {
  getNotificationSettings,
  updateNotificationSettings,
  registerForPushNotificationsAsync,
  savePushToken,
} from '../services/notifications';
import type { NotificationSettings } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav } from '../components';

/**
 * NotificationSettingsScreen - Manage notification preferences
 */
export default function NotificationSettingsScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        navigation.goBack();
        return;
      }

      const notifSettings = await getNotificationSettings(user.id);
      setSettings(notifSettings);

      // Check notification permissions
      try {
        const token = await registerForPushNotificationsAsync();
        setHasPermission(!!token);
        
        // Save the token if we got one
        await savePushToken(user.id, token);
      } catch (error) {
        console.warn('Could not register for push notifications:', error);
        // Assume we don't have permission if registration failed
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = async (
    key: keyof Pick<
      NotificationSettings,
      'notify_30min_before_game' | 'notify_5min_before_game' | 'notify_new_chat_message' | 'notify_player_joins_game'
    >,
    value: boolean
  ) => {
    if (!settings) return;

    // Optimistically update UI
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    try {
      setIsSaving(true);
      const user = await getCurrentUser();
      if (!user) throw new Error('User not found');

      await updateNotificationSettings(user.id, { [key]: value });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
      // Revert optimistic update
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      const user = await getCurrentUser();
      if (user) {
        await savePushToken(user.id, token);
      }
      
      if (token) {
        setHasPermission(true);
        Alert.alert('Success', 'Notification permissions granted!');
      } else {
        // No token means we're likely in Expo Go or permissions denied
        Alert.alert(
          'Limited Support',
          'Push notifications require a development build. Local notifications will still work in Expo Go.\n\nFor full push notification support, create a development build.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert(
        'Note',
        'Push notifications are not available in Expo Go. Local notifications will still work for immediate events.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TopNav
          title="Notifications"
          centered
          leftAction={{
            icon: '←',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <TopNav
          title="Notifications"
          centered
          leftAction={{
            icon: '←',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav
        title="Notifications"
        centered
        leftAction={{
          icon: '←',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        {hasPermission === false && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionBannerTitle}>⚠️ Notifications Disabled</Text>
            <Text style={styles.permissionBannerText}>
              Enable notifications to receive game reminders and updates.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermissions}
            >
              <Text style={styles.permissionButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Choose which notifications you'd like to receive. You can change these settings anytime.
          </Text>
        </View>

        {/* Settings Section: Game Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Reminders</Text>

          <SettingItem
            icon="⏰"
            title="30 minutes before game"
            description="Get notified 30 minutes before your game starts"
            value={settings.notify_30min_before_game}
            onValueChange={(value) => handleToggleSetting('notify_30min_before_game', value)}
            disabled={isSaving}
          />

          <SettingItem
            icon="⏱️"
            title="5 minutes before game"
            description="Get notified 5 minutes before your game starts"
            value={settings.notify_5min_before_game}
            onValueChange={(value) => handleToggleSetting('notify_5min_before_game', value)}
            disabled={isSaving}
          />
        </View>

        {/* Settings Section: Game Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Activity</Text>

          <SettingItem
            icon="👥"
            title="Player joins game"
            description="Get notified when someone joins your game"
            value={settings.notify_player_joins_game}
            onValueChange={(value) => handleToggleSetting('notify_player_joins_game', value)}
            disabled={isSaving}
          />

          <SettingItem
            icon="💬"
            title="New chat message"
            description="Get notified when there's a new message in game chat"
            value={settings.notify_new_chat_message}
            onValueChange={(value) => handleToggleSetting('notify_new_chat_message', value)}
            disabled={isSaving}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Notifications are sent based on your game schedule and activity. Make sure to have notifications enabled in your device settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingItem({ icon, title, description, value, onValueChange, disabled }: SettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.textTertiary}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  permissionBanner: {
    backgroundColor: Colors.warningLight,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  permissionBannerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning,
    marginBottom: Spacing.xs,
  },
  permissionBannerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  permissionButton: {
    backgroundColor: Colors.warning,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  descriptionContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  section: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.error,
  },
});

