import React from 'react';
import { Text, TextStyle } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FreePlayScreen } from './FreePlayScreen';
import { LeaderboardsScreen } from './LeaderboardsScreen';
import ProfileScreen from './ProfileScreen';
import { Colors, Typography } from '../theme';

const Tab = createBottomTabNavigator();

/**
 * HomeScreen - Bottom tab navigation container
 * Contains: Free Play, Leaderboards, Profile
 */
export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: '500' as TextStyle['fontWeight'],
        },
      }}
    >
      <Tab.Screen
        name="FreePlay"
        component={FreePlayScreen}
        options={{
          tabBarLabel: 'Free Play',
          tabBarIcon: ({ color }) => <TabIcon icon="🏀" color={color} />,
        }}
      />
      <Tab.Screen
        name="Leaderboards"
        component={LeaderboardsScreen}
        options={{
          tabBarLabel: 'Leaderboards',
          tabBarIcon: ({ color }) => <TabIcon icon="🏆" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Simple emoji-based icon component
interface TabIconProps {
  icon: string;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon }) => {
  return <Text style={{ fontSize: 24 }}>{icon}</Text>;
};

