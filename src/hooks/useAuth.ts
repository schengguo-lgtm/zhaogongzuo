/**
 * useAuth hook — subscribes to Firebase auth state and syncs with Zustand.
 */

import { useEffect } from 'react';
import { subscribeToAuth } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

/** Build a minimal app User from the Firebase user (for MVP). */
function buildAppUser(firebaseUser: import('firebase/auth').User): User {
  return {
    id: firebaseUser.uid,
    phone: firebaseUser.phoneNumber ?? '',
    name: firebaseUser.displayName ?? '',
    role: 'worker',          // default; updated during onboarding
    status: 'active',
    language: 'ko',
    createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
  };
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
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setFirebaseUser(user);
      if (user) {
        setAppUser(buildAppUser(user));
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setAppUser, setFirebaseUser, setLoading]);

  return { firebaseUser, appUser, isLoading, isAuthenticated };
}
