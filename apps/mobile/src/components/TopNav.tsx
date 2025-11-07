import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows } from '../theme';

interface TopNavProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
  rightAction?: {
    icon: string;
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
                <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButton}>
                  <Text style={styles.actionIcon}>{leftAction.icon}</Text>
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
              {rightAction && (
                <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
                  <Text style={styles.actionIcon}>{rightAction.icon}</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Title on Left */}
            <View style={styles.titleContainerLeft}>
              {leftAction && (
                <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButtonLeft}>
                  <Text style={styles.actionIcon}>{leftAction.icon}</Text>
                </TouchableOpacity>
              )}
              <View>
                <Text style={styles.titleLeft}>{title}</Text>
                {subtitle && <Text style={styles.subtitleLeft}>{subtitle}</Text>}
              </View>
            </View>

            {/* Right Action (Profile) */}
            {rightAction && (
              <TouchableOpacity onPress={rightAction.onPress} style={styles.profileButton}>
                {rightAction.label ? (
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>{rightAction.label}</Text>
                  </View>
                ) : (
                  <Text style={styles.actionIcon}>{rightAction.icon}</Text>
                )}
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
    borderBottomColor: Colors.border,
  },
  // Centered layout styles
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
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
  },
  actionIcon: {
    fontSize: 24,
  },
  // Left-aligned layout styles
  titleContainerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleLeft: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  subtitleLeft: {
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
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  profileAvatarText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
});

