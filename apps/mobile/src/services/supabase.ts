import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// These will be configured when Supabase is set up
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Secure storage adapter for Supabase auth tokens
// Handles large values by splitting them into chunks
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    // Check if we have a chunked value
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
    if (chunkCountStr) {
      const chunkCount = parseInt(chunkCountStr, 10);
      let value = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (chunk) value += chunk;
      }
      return value;
    }
    // Otherwise return the normal value
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    // If value is larger than 2048 bytes, split into chunks
    if (value.length > 2048) {
      const chunkSize = 2048;
      const chunkCount = Math.ceil(value.length / chunkSize);
      
      // Store each chunk
      for (let i = 0; i < chunkCount; i++) {
        const chunk = value.slice(i * chunkSize, (i + 1) * chunkSize);
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
      }
      
      // Store chunk count
      await SecureStore.setItemAsync(`${key}_chunk_count`, chunkCount.toString());
      
      // Remove old non-chunked value if it exists
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        // Ignore error if key doesn't exist
      }
    } else {
      // Store normally if small enough
      await SecureStore.setItemAsync(key, value);
      
      // Clean up any old chunks
      try {
        const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
        if (chunkCountStr) {
          const chunkCount = parseInt(chunkCountStr, 10);
          for (let i = 0; i < chunkCount; i++) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
          }
          await SecureStore.deleteItemAsync(`${key}_chunk_count`);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  removeItem: async (key: string) => {
    // Remove chunked values if they exist
    try {
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_chunk_count`);
      }
    } catch {
      // Ignore errors
    }
    
    // Remove normal value
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

