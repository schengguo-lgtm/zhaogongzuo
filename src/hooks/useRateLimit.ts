/**
 * useRateLimit hook — basic client-side rate limiting.
 *
 * Stores attempt counts in AsyncStorage keyed by action + date.
 * This is a UX guard only; MUST be enforced server-side as well.
 *
 * TODO (Production):
 *  - Implement server-side rate limiting via Cloud Functions or API middleware.
 *  - Use sliding window or token bucket algorithm server-side.
 *  - Per-user limits should be stored in Firestore / Redis, not just locally.
 */

import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

type RateLimitAction = 'apply' | 'sendOtp' | 'uploadDocument';

const ACTION_LIMITS: Record<RateLimitAction, number> = {
  apply: Config.maxDailyApplications,
  sendOtp: 5,
  uploadDocument: 20,
};

function getTodayKey(action: RateLimitAction): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `@ratelimit/${action}/${today}`;
}

export function useRateLimit() {
  /** Check if an action is allowed. Does NOT consume a token. */
  const canPerformAction = useCallback(
    async (action: RateLimitAction): Promise<boolean> => {
      const key = getTodayKey(action);
      const stored = await AsyncStorage.getItem(key);
      const count = stored ? parseInt(stored, 10) : 0;
      return count < ACTION_LIMITS[action];
    },
    [],
  );

  /** Consume one token. Returns false if limit was already reached. */
  const consumeToken = useCallback(
    async (action: RateLimitAction): Promise<boolean> => {
      const key = getTodayKey(action);
      const stored = await AsyncStorage.getItem(key);
      const count = stored ? parseInt(stored, 10) : 0;
      const limit = ACTION_LIMITS[action];
      if (count >= limit) return false;
      await AsyncStorage.setItem(key, String(count + 1));
      return true;
    },
    [],
  );

  /** Get remaining tokens for today. */
  const getRemainingTokens = useCallback(
    async (action: RateLimitAction): Promise<number> => {
      const key = getTodayKey(action);
      const stored = await AsyncStorage.getItem(key);
      const count = stored ? parseInt(stored, 10) : 0;
      return Math.max(0, ACTION_LIMITS[action] - count);
    },
    [],
  );

  return { canPerformAction, consumeToken, getRemainingTokens };
}
