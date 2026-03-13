/**
 * Auth context: token, user, login, logout, restore session from storage.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/authApi';
import { setAuthToken, clearAuthToken } from '../api/inventoryApi';

const AUTH_TOKEN_KEY = '@barbrain_auth_token';
const AUTH_USER_KEY = '@barbrain_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((t) => {
    setTokenState(t);
    if (t) {
      setAuthToken(t);
      AsyncStorage.setItem(AUTH_TOKEN_KEY, t);
    } else {
      clearAuthToken();
      AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      AsyncStorage.removeItem(AUTH_USER_KEY);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      const u = await authApi.getMe(storedToken);
      setUser(u);
      setTokenState(storedToken);
      setAuthToken(storedToken);
    } catch {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      clearAuthToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email, password) => {
      const { user: u, token: t } = await authApi.signin(email, password);
      setUser(u);
      setToken(t);
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    },
    [setToken]
  );

  const signupAndLogin = useCallback(
    async (payload) => {
      await authApi.signup(payload);
      const { user: u, token: t } = await authApi.signin(
        payload.email,
        payload.password
      );
      setUser(u);
      setToken(t);
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    },
    [setToken]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.signout(token);
    } catch {
      // Ignore
    }
    setUser(null);
    setToken(null);
  }, [token, setToken]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    signupAndLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
