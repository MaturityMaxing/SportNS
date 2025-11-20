import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../theme';
import type { LucideIcon } from 'lucide-react-native';

interface TopNavProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: LucideIcon;
    onPress: () => void;
  };
  rightAction?: {
    icon?: LucideIcon;
    onPress: () => void;
    label?: string;
  };
  centered?: boolean; // Option to center title (for other screens)
}

/**
 * TopNav - Reusable top navigation/header component
 */
export const TopNav: React.FC<TopNavProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  centered = false,
}) => {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {centered ? (
          <>
            {/* Left Action */}
            <View style={styles.actionContainer}>
              {leftAction && (
                <TouchableOpacity 
                  onPress={leftAction.onPress} 
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <leftAction.icon size={24} color={Colors.text} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {/* Title and Subtitle (Centered) */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Right Action */}
            <View style={styles.actionContainer}>
              {rightAction && rightAction.icon && (
                <TouchableOpacity 
                  onPress={rightAction.onPress} 
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <rightAction.icon size={24} color={Colors.text} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Title on Left */}
            <View style={styles.titleContainerLeft}>
              {leftAction && (
                <TouchableOpacity 
                  onPress={leftAction.onPress} 
                  style={styles.actionButtonLeft}
                  activeOpacity={0.7}
                >
                  <leftAction.icon size={24} color={Colors.text} strokeWidth={2} />
                </TouchableOpacity>
              )}
              <View>
                <Text style={styles.titleLeft}>{title}</Text>
                {subtitle && <Text style={styles.subtitleLeft}>{subtitle}</Text>}
              </View>
            </View>

            {/* Right Action (Profile) */}
            {rightAction && (
              <TouchableOpacity 
                onPress={rightAction.onPress} 
                style={styles.profileButton}
                activeOpacity={0.7}
              >
                {rightAction.label ? (
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>{rightAction.label}</Text>
                  </View>
                ) : rightAction.icon ? (
                  <rightAction.icon size={24} color={Colors.text} strokeWidth={2} />
                ) : null}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  // Centered layout styles
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionContainer: {
    width: 40,
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  // Left-aligned layout styles
  titleContainerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleLeft: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  subtitleLeft: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionButtonLeft: {
    padding: Spacing.xs,
  },
  profileButton: {
    padding: Spacing.xs,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  profileAvatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
});

