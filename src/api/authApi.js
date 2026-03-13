/**
 * Auth API client - signin, signup, signout, getMe.
 * Uses same base URL as inventory API (supports local + live fallback).
 */
import axios from 'axios';
import {
  getApiFullUrl,
  switchToLiveUrl,
  isUsingLiveUrl,
} from '../config/api';

const api = axios.create({
  baseURL: getApiFullUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiFullUrl();
  return config;
});

function isNetworkError(err) {
  if (err.response) return false;
  const code = err.code || err.message || '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ERR_NETWORK' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    String(code).includes('Network Error')
  );
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config || {};
    if (
      __DEV__ &&
      !isUsingLiveUrl() &&
      isNetworkError(err) &&
      !config._retriedWithLive
    ) {
      config._retriedWithLive = true;
      switchToLiveUrl();
      api.defaults.baseURL = getApiFullUrl();
      try {
        return await api.request(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    return Promise.reject(err);
  }
);

async function handleResponse(res) {
  const data = res.data;
  if (data && data.success === false) {
    throw new Error(data.message || 'API error');
  }
  return data?.data ?? data;
}

async function handleError(err) {
  const msg = err.response?.data?.message || err.message || 'Network error';
  throw new Error(msg);
}

/**
 * Sign in with email and password.
 * @returns {{ user, token }}
 */
export async function signin(email, password) {
  const data = await handleResponse(
    await api.post('auth/signin', { email, password })
  );
  return { user: data?.user, token: data?.token };
}

/**
 * Register a new user.
 * @param {object} payload - { firstName, lastName, username, email, phoneNumber, password }
 * @returns {object} user
 */
export async function signup(payload) {
  const data = await handleResponse(
    await api.post('auth/signup', payload)
  );
  return data?.user ?? data;
}

/**
 * Sign out (clears server cookie; client clears token separately).
 */
export async function signout(token) {
  try {
    await api.get('auth/signout', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // Ignore - token may already be invalid
  }
}

/**
 * Get current user (requires valid token).
 */
export async function getMe(token) {
  const data = await handleResponse(
    await api.get('auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  );
  return data?.user ?? data;
}
