import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/services/auth";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "@/services/tokenStore";
import type { AuthState } from "@/types/api";

type RegisterInput = Parameters<typeof registerRequest>[0];

type AuthContextValue = AuthState & {
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    accessToken: null,
    refreshToken: null,
    profile: null,
  });

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setState((current) => ({ ...current, profile }));
    } catch {
      await clearTokens();
      setState({
        isLoading: false,
        accessToken: null,
        refreshToken: null,
        profile: null,
      });
    }
  };

  const bootstrapSession = async () => {
    const [accessToken, refreshToken] = await Promise.all([
      getAccessToken(),
      getRefreshToken(),
    ]);

    if (!accessToken || !refreshToken) {
      setState({
        isLoading: false,
        accessToken: null,
        refreshToken: null,
        profile: null,
      });
      return;
    }

    setState({
      isLoading: false,
      accessToken,
      refreshToken,
      profile: null,
    });

    void loadProfile();
  };

  useEffect(() => {
    void bootstrapSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: async (username, password) => {
        await loginRequest({ username, password });
        await bootstrapSession();
      },
      signUp: async (payload) => {
        await registerRequest(payload);
      },
      signOut: async () => {
        await logoutRequest();
        setState({
          isLoading: false,
          accessToken: null,
          refreshToken: null,
          profile: null,
        });
      },
      reloadProfile: async () => {
        await loadProfile();
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
