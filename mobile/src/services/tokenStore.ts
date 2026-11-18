import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'gerador_contratos_access_token';
const REFRESH_KEY = 'gerador_contratos_refresh_token';

async function setItem(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    setItem(ACCESS_KEY, accessToken),
    setItem(REFRESH_KEY, refreshToken),
  ]);
}

export async function getAccessToken() {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(ACCESS_KEY);
  }

  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken() {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(REFRESH_KEY);
  }

  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens() {
  await Promise.all([setItem(ACCESS_KEY, null), setItem(REFRESH_KEY, null)]);
}
