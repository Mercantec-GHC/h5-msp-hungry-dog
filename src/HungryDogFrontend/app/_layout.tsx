import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getStoredItem } from '@/services/storage';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const token = await getStoredItem('token');
        if (token) {
          // Hvis brugeren allerede har token, sendes de direkte til tabs.
          router.replace('/(tabs)');
        }
        // Ellers bliver brugeren på index, som sender videre til login.
      } catch (error) {
        console.error('Initial auth check error:', error);
      } finally {
        setIsReady(true);
      }
    };

    checkInitialAuth();
  }, []);

  if (!isReady) {
    // Undgår at vise routes før første auth-check er færdigt.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
