import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'flat';
  padding?: keyof typeof Spacing;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md',
}) => {
  return (
    <View style={[
      styles.card, 
      variant === 'default' && styles.cardDefault,
      variant === 'outlined' && styles.cardOutlined,
      variant === 'flat' && styles.cardFlat,
      { padding: Spacing[padding] },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
  },
  cardDefault: {
    backgroundColor: Colors.surface,
    ...Shadows.medium,
  },
  cardOutlined: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardFlat: {
    backgroundColor: Colors.backgroundSecondary,
  },
});

