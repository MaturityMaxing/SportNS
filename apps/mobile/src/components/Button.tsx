import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  // Get variant styles
  const variantStyle = variant === 'primary' ? styles.buttonPrimary :
                       variant === 'secondary' ? styles.buttonSecondary :
                       variant === 'outline' ? styles.buttonOutline :
                       styles.buttonGhost;

  const sizeStyle = size === 'small' ? styles.buttonSmall :
                    size === 'large' ? styles.buttonLarge :
                    styles.buttonMedium;

  const textVariantStyle = variant === 'primary' ? styles.buttonTextPrimary :
                           variant === 'secondary' ? styles.buttonTextSecondary :
                           variant === 'outline' ? styles.buttonTextOutline :
                           styles.buttonTextGhost;

  const textSizeStyle = size === 'small' ? styles.buttonTextSmall :
                        size === 'large' ? styles.buttonTextLarge :
                        styles.buttonTextMedium;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variantStyle,
        sizeStyle,
        isDisabled && styles.buttonDisabled,
        fullWidth && styles.buttonFullWidth,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverse}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            textVariantStyle,
            textSizeStyle,
            isDisabled && styles.buttonTextDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    ...Shadows.small,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
    ...Shadows.small,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  buttonMedium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  buttonLarge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonTextPrimary: {
    color: Colors.textInverse,
  },
  buttonTextSecondary: {
    color: Colors.textInverse,
  },
  buttonTextOutline: {
    color: Colors.primary,
  },
  buttonTextGhost: {
    color: Colors.primary,
  },
  buttonTextSmall: {
    fontSize: Typography.fontSize.sm,
  },
  buttonTextMedium: {
    fontSize: Typography.fontSize.md,
  },
  buttonTextLarge: {
    fontSize: Typography.fontSize.lg,
  },
  buttonTextDisabled: {
    // Opacity handled by parent
  },
});

