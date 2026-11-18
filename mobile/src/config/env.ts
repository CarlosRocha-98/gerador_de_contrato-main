import { Platform } from 'react-native';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL =
  rawApiUrl && rawApiUrl.length > 0
    ? rawApiUrl.replace(/\/+$/, '')
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:8000'
      : 'http://localhost:8000';