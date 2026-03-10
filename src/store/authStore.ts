/**
 * Auth store — tracks current Firebase user and app user profile.
 */

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User, UserRole, Language } from '../types';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  setFirebaseUser: (user: FirebaseUser | null) => void;
  setAppUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHasCompletedOnboarding: (v: boolean) => void;
  updateRole: (role: UserRole) => void;
  updateLanguage: (language: Language) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  appUser: null,
  isLoading: true,
  isAuthenticated: false,
  hasCompletedOnboarding: false,

  setFirebaseUser: (user) =>
    set({ firebaseUser: user, isAuthenticated: !!user, isLoading: false }),

  setAppUser: (user) => set({ appUser: user }),

  setLoading: (loading) => set({ isLoading: loading }),

  setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),

  updateRole: (role) =>
    set((state) =>
      state.appUser
        ? { appUser: { ...state.appUser, role } }
        : state,
    ),

  updateLanguage: (language) =>
    set((state) =>
      state.appUser
        ? { appUser: { ...state.appUser, language } }
        : state,
    ),

  reset: () =>
    set({
      firebaseUser: null,
      appUser: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    }),
}));
