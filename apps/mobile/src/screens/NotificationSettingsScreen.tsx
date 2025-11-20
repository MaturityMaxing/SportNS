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
import { ArrowLeft, Clock, Users, MessageSquare, AlertTriangle, Info } from 'lucide-react-native';
import { getCurrentUser } from '../services/auth';
import {
  getNotificationSettings,
  updateNotificationSettings,
  registerForPushNotificationsAsync,
  savePushToken,
} from '../services/notifications';
import type { NotificationSettings } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import { TopNav, Card } from '../components';

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
            icon: ArrowLeft,
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
            icon: ArrowLeft,
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
          icon: ArrowLeft,
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        {hasPermission === false && (
          <View style={styles.permissionBannerContainer}>
            <Card style={styles.permissionBanner}>
              <View style={styles.permissionBannerContent}>
                <View style={styles.permissionBannerIconContainer}>
                  <AlertTriangle size={24} color={Colors.warning} strokeWidth={2} />
                </View>
                <View style={styles.permissionBannerTextContainer}>
                  <Text style={styles.permissionBannerTitle}>Notifications Disabled</Text>
                  <Text style={styles.permissionBannerText}>
                    Enable notifications to receive game reminders and updates.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={handleRequestPermissions}
                activeOpacity={0.85}
              >
                <Text style={styles.permissionButtonText}>Enable Notifications</Text>
              </TouchableOpacity>
            </Card>
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
          
          <Card style={styles.settingsCard}>
            <SettingItem
              icon={Clock}
              title="30 minutes before game"
              description="Get notified 30 minutes before your game starts"
              value={settings.notify_30min_before_game}
              onValueChange={(value) => handleToggleSetting('notify_30min_before_game', value)}
              disabled={isSaving}
            />
            
            <View style={styles.settingDivider} />
            
            <SettingItem
              icon={Clock}
              title="5 minutes before game"
              description="Get notified 5 minutes before your game starts"
              value={settings.notify_5min_before_game}
              onValueChange={(value) => handleToggleSetting('notify_5min_before_game', value)}
              disabled={isSaving}
            />
          </Card>
        </View>

        {/* Settings Section: Game Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Activity</Text>
          
          <Card style={styles.settingsCard}>
            <SettingItem
              icon={Users}
              title="Player joins game"
              description="Get notified when someone joins your game"
              value={settings.notify_player_joins_game}
              onValueChange={(value) => handleToggleSetting('notify_player_joins_game', value)}
              disabled={isSaving}
            />
            
            <View style={styles.settingDivider} />
            
            <SettingItem
              icon={MessageSquare}
              title="New chat message"
              description="Get notified when there's a new message in game chat"
              value={settings.notify_new_chat_message}
              onValueChange={(value) => handleToggleSetting('notify_new_chat_message', value)}
              disabled={isSaving}
            />
          </Card>
        </View>

        {/* Info Section */}
        <View style={styles.infoSectionContainer}>
          <Card variant="flat" style={styles.infoCard}>
            <View style={styles.infoContent}>
              <View style={styles.infoIconContainer}>
                <Info size={20} color={Colors.textSecondary} strokeWidth={2} />
              </View>
              <Text style={styles.infoText}>
                Notifications are sent based on your game schedule and activity. Make sure to have notifications enabled in your device settings.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

interface SettingItemProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingItem({ icon: Icon, title, description, value, onValueChange, disabled }: SettingItemProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingIconContainer}>
          <Icon size={20} color={Colors.textSecondary} strokeWidth={2} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.borderLight, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.textTertiary}
        ios_backgroundColor={Colors.borderLight}
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
  permissionBannerContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  permissionBanner: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  permissionBannerContent: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  permissionBannerIconContainer: {
    marginRight: Spacing.md,
  },
  permissionBannerTextContainer: {
    flex: 1,
  },
  permissionBannerTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.warning,
    marginBottom: Spacing.xs,
  },
  permissionBannerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  permissionButton: {
    backgroundColor: Colors.warning,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textInverse,
  },
  descriptionContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  section: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    marginHorizontal: Spacing.md,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs / 2,
  },
  settingDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.relaxed,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },
  infoSectionContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  infoCard: {
    padding: Spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
  },
  infoIconContainer: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.relaxed,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.error,
  },
});

