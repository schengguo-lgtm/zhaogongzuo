/**
 * useAuth hook — subscribes to Firebase auth state and syncs with Zustand.
 * Also restores and persists the session to AsyncStorage so the user
 * stays logged in after the app is restarted.
 */

import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeToAuth } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

const SESSION_KEY = '@zhaogongzuo/session';
const ONBOARDING_KEY = '@zhaogongzuo/onboarding';

/** Build a minimal app User from the Firebase user (for production). */
function buildAppUser(firebaseUser: import('firebase/auth').User): User {
  return {
    id: firebaseUser.uid,
    phone: firebaseUser.phoneNumber ?? '',
    name: firebaseUser.displayName ?? '',
    role: 'worker',
    status: 'active',
    language: 'ko',
    createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
  };
}

/** Save the current user session to AsyncStorage atomically. */
export async function persistSession(user: User, onboarding: boolean): Promise<void> {
  // Use multiSet for an atomic write — avoids a state where one key is saved
  // and the other is not if the app is killed between two separate setItem calls.
  await AsyncStorage.multiSet([
    [SESSION_KEY, JSON.stringify({ ...user, createdAt: user.createdAt.toISOString() })],
    [ONBOARDING_KEY, JSON.stringify(onboarding)],
  ]);
}

/** Clear the persisted session (on logout). */
export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([SESSION_KEY, ONBOARDING_KEY]);
}

/** Try to restore a previously saved session. Returns null if none. */
async function restoreSession(): Promise<{ user: User; onboarding: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    const onboardingRaw = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User & { createdAt: string };
    return {
      user: { ...parsed, createdAt: new Date(parsed.createdAt) },
      onboarding: onboardingRaw ? (JSON.parse(onboardingRaw) as boolean) : false,
    };
  } catch {
    return null;
  }
}

export function useAuth() {
  const {
    firebaseUser,
    appUser,
    isLoading,
    isAuthenticated,
    setFirebaseUser,
    setAppUser,
    setLoading,
    setHasCompletedOnboarding,
  } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    // Step 1: try to restore a previously saved session immediately
    restoreSession().then((saved) => {
      if (!isMounted) return;
      if (saved) {
        setAppUser(saved.user);
        setHasCompletedOnboarding(saved.onboarding);
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Step 2: also subscribe to real Firebase auth (for production Firebase login)
    const unsubscribe = subscribeToAuth((fbUser) => {
      if (!isMounted) return;
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Real Firebase login — build user from Firebase data and save session
        const user = buildAppUser(fbUser);
        setAppUser(user);
        persistSession(user, false).catch(console.error);
      }
      // If fbUser is null, do NOT clear appUser — it may be a mock/demo user.
      // The user is only cleared on explicit logout (reset() + clearSession()).
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setAppUser, setFirebaseUser, setLoading, setHasCompletedOnboarding]);

  return { firebaseUser, appUser, isLoading, isAuthenticated };
}
