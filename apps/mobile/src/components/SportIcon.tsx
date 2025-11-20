import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import type { Sport } from '../types';

// Import SVG files as React components
import BasketballIcon from '../svgs/basketball-svgrepo-com (1).svg';
import PingPongIcon from '../svgs/ping-pong-svgrepo-com (1).svg';
import VolleyballIcon from '../svgs/volleyball-svgrepo-com (1).svg';
import FootballIcon from '../svgs/football-svgrepo-com.svg';
import BadmintonIcon from '../svgs/badminton-2-svgrepo-com.svg';
import TennisIcon from '../svgs/tennis-ball-thin-svgrepo-com.svg';
import GolfIcon from '../svgs/golf-svgrepo-com (1).svg';
import RunningIcon from '../svgs/run-svgrepo-com.svg';
import PickleballIcon from '../svgs/pickleball-svgrepo-com.svg';

// Map sport slugs to SVG components
const SPORT_SVG_MAP: Record<string, React.ComponentType<any>> = {
  basketball: BasketballIcon,
  pickleball: PickleballIcon,
  volleyball: VolleyballIcon,
  football: FootballIcon,
  'ping-pong': PingPongIcon,
  badminton: BadmintonIcon,
  tennis: TennisIcon,
  golf: GolfIcon,
  running: RunningIcon,
};

type SportIconProps = {
  sport: Sport | { slug: string } | null | undefined;
  size?: number;
  color?: string;
  style?: ViewStyle;
};

/**
 * SportIcon Component
 * Renders SVG icons for sports based on sport slug
 */
export const SportIcon: React.FC<SportIconProps> = ({
  sport,
  size = 24,
  color,
  style,
}) => {
  if (!sport?.slug) {
    // Fallback to running icon if no sport provided
    const IconComponent = RunningIcon;
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <IconComponent width={size} height={size} fill={color || '#000000'} />
      </View>
    );
  }

  const slug = sport.slug.toLowerCase();
  const IconComponent = SPORT_SVG_MAP[slug] || RunningIcon;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <IconComponent width={size} height={size} fill={color || '#000000'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

