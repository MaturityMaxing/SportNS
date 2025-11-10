import React from 'react';
import { Text, TextStyle } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MyGamesScreen } from './MyGamesScreen';
import { DashboardScreen } from './DashboardScreen';
import { LeaderboardsScreen } from './LeaderboardsScreen';
import ProfileScreen from './ProfileScreen';
import { PostGameScreen } from './PostGameScreen';
import { Colors, Typography } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * MainTabs - Bottom tab navigation with 3 tabs
 * Contains: My Games, Dashboard, Leagues
 */
const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
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
        name="MyGames"
        component={MyGamesScreen}
        options={{
          tabBarLabel: 'My Games',
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon icon="🎮" color={color} />,
        }}
      />
      <Tab.Screen
        name="Leagues"
        component={LeaderboardsScreen}
        options={{
          tabBarLabel: 'Leagues',
          tabBarIcon: ({ color }) => <TabIcon icon="🏆" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * HomeScreen - Main navigation container with Stack Navigator
 * Wraps tabs and includes Profile and PostGame screens outside of tabs
 */
export const HomeScreen: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PostGame" component={PostGameScreen} />
    </Stack.Navigator>
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

