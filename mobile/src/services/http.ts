import axios, { InternalAxiosRequestConfig } from 'axios';

import { API_URL } from '@/config/env';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStore';

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error?.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      String(originalRequest.url || '').includes('/api/token/')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await clearTokens();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post('/api/token/refresh/', { refresh: refreshToken })
        .then(async response => {
          const newAccess = response.data?.access;

          if (!newAccess) {
            return null;
          }

          await setTokens(newAccess, refreshToken);
          return newAccess as string;
        })
        .catch(async refreshError => {
          await clearTokens();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        await clearTokens();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return http.request(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export async function requestJson<T>(path: string) {
  const response = await http.get<T>(path);
  return response.data;
}

export async function sendJson<T>(
  path: string,
  payload: unknown,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post'
) {
  const response = await http.request<T>({
    url: path,
    method,
    data: payload,
  });

  return response.data;
}