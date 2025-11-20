import React from 'react';
import { TextStyle } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, Home, Trophy } from 'lucide-react-native';
import { MyGamesScreen } from './MyGamesScreen';
import { DashboardScreen } from './DashboardScreen';
import { LeaderboardsScreen } from './LeaderboardsScreen';
import ProfileScreen from './ProfileScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import { PostGameScreen } from './PostGameScreen';
import { GameDetailScreen } from './GameDetailScreen';
import { ReEvaluateSkillsScreen } from './ReEvaluateSkillsScreen';
import { PlayersListScreen } from './PlayersListScreen';
import { Colors, Typography } from '../theme';
import { useNotifications } from '../hooks/useNotifications';

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
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.medium,
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
          tabBarIcon: ({ color, size }) => <ClipboardList size={size || 24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size || 24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Leagues"
        component={LeaderboardsScreen}
        options={{
          tabBarLabel: 'Leagues',
          tabBarIcon: ({ color, size }) => <Trophy size={size || 24} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * HomeScreen - Main navigation container with Stack Navigator
 * Wraps tabs and includes Profile, PostGame, and GameDetail screens outside of tabs
 */
export const HomeScreen: React.FC = () => {
  // Set up notification handlers
  useNotifications();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PostGame" component={PostGameScreen} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
      <Stack.Screen name="ReEvaluateSkills" component={ReEvaluateSkillsScreen} />
      <Stack.Screen name="PlayersList" component={PlayersListScreen} />
    </Stack.Navigator>
  );
};


