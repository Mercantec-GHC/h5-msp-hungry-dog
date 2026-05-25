import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export async function getStoredItem(key: string) {
  if (isWeb) {
    // Expo SecureStore virker ikke ens på web, så browseren bruger localStorage.
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

export async function setStoredItem(key: string, value: string) {
  if (isWeb) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteStoredItem(key: string) {
  if (isWeb) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
