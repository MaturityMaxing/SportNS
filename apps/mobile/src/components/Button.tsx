import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  View,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
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
  rightIcon?: LucideIcon;
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
  rightIcon: RightIcon,
}) => {
  const isDisabled = disabled || loading;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

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
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.buttonFullWidth, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          variantStyle,
          sizeStyle,
          isDisabled && styles.buttonDisabled,
          fullWidth && styles.buttonFullWidth,
        ]}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverse}
            size="small"
          />
        ) : (
          <>
            <Text
              style={[
                styles.buttonText,
                textVariantStyle,
                textSizeStyle,
                isDisabled && styles.buttonTextDisabled,
                textStyle,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={false}
            >
              {title}
            </Text>
            {RightIcon && (
              <View style={styles.rightIconContainer}>
                <RightIcon 
                  size={size === 'large' ? 20 : size === 'small' ? 16 : 18} 
                  color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverse} 
                  strokeWidth={2} 
                />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
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
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.3,
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
  rightIconContainer: {
    marginLeft: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

