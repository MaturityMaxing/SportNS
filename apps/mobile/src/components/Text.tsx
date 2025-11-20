import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Typography } from '../theme';

interface TextProps extends RNTextProps {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/**
 * Custom Text component that applies the Inter font family by default
 * Usage: <Text weight="medium">Hello</Text>
 */
export const Text: React.FC<TextProps> = ({ 
  style, 
  weight = 'regular',
  ...props 
}) => {
  const fontFamily = weight === 'regular' ? Typography.fontFamily.regular :
                     weight === 'medium' ? Typography.fontFamily.medium :
                     weight === 'semibold' ? Typography.fontFamily.semibold :
                     Typography.fontFamily.bold;

  return (
    <RNText
      style={[styles.default, { fontFamily }, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    // Default font family will be applied via style prop
  },
});

