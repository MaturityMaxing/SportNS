import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * SportNS - Community Sports Platform
 * Day 1: Foundation Setup Complete
 * 
 * Next Steps:
 * - Day 2: Implement Discord OAuth Authentication
 * - Day 3: Set up React Navigation with bottom tabs
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏀 SportNS</Text>
      <Text style={styles.subtitle}>Community Sports Platform</Text>
      <Text style={styles.status}>Day 1: Foundation Ready ✓</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
