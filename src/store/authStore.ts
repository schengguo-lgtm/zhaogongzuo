/**
 * Auth store — tracks current Firebase user and app user profile.
 *
 * isAuthenticated is driven by appUser (not firebaseUser), so it works
 * for both real Firebase auth AND the mock OTP flow used in the MVP demo.
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

  // Only update the firebaseUser reference; do NOT touch isAuthenticated here.
  // isAuthenticated is solely controlled by setAppUser so mock auth works too.
  setFirebaseUser: (user) =>
    set({ firebaseUser: user }),

  // Setting appUser drives isAuthenticated for both real and mock auth.
  setAppUser: (user) =>
    set({ appUser: user, isAuthenticated: !!user }),

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
      isLoading: false, // keep false so the app doesn't hang on logout
      hasCompletedOnboarding: false,
    }),
}));
