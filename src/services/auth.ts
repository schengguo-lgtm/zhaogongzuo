/**
 * Firebase Auth service — Phone/OTP authentication
 *
 * When Firebase is not configured (demo/simulator mode) all functions degrade
 * gracefully: subscribeToAuth immediately returns null, signOut is a no-op,
 * and sendOtp/verifyOtp throw a clear "not configured" error.
 *
 * TODO (Production):
 *  - Set reCAPTCHA / App Check to prevent abuse.
 *  - Add server-side rate limiting (Cloud Functions) as a second layer.
 *  - Log auth events to your audit trail.
 */

import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseReady } from './firebase';

// NOTE: RecaptchaVerifier is web-only. For React Native / Expo use
// @react-native-firebase/auth with phone sign-in instead.
// This file is a structural placeholder that shows the intended API.

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize invisible reCAPTCHA (web-only).
 * For React Native use @react-native-firebase/auth directly.
 */
export function initRecaptcha(containerId: string): void {
  if (!auth) return;
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
}

/**
 * Send OTP to the given phone number.
 * Returns a verificationId to pass to verifyOtp().
 *
 * Rate limiting (client-side):
 *  - Enforced by Firebase automatically (per-phone throttle).
 *  - Additional client guard in useRateLimit hook.
 */
export async function sendOtp(phoneNumber: string): Promise<string> {
  if (!auth || !isFirebaseReady) {
    throw new Error(
      'Firebase Phone Auth is required to send OTP. ' +
      'Configure your Firebase project in .env (see README for setup instructions).',
    );
  }
  if (!recaptchaVerifier) {
    throw new Error('RecaptchaVerifier not initialized. Call initRecaptcha() first.');
  }
  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(
    phoneNumber,
    recaptchaVerifier,
  );
  return verificationId;
}

/**
 * Verify OTP code.
 * Returns the signed-in Firebase user.
 */
export async function verifyOtp(
  verificationId: string,
  code: string,
): Promise<FirebaseUser> {
  if (!auth || !isFirebaseReady) {
    throw new Error(
      'Firebase Phone Auth is required to verify OTP. ' +
      'Configure your Firebase project in .env (see README for setup instructions).',
    );
  }
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

/** Sign out the current user. No-op if Firebase is not configured. */
export async function signOut(): Promise<void> {
  if (!auth || !isFirebaseReady) return;
  await firebaseSignOut(auth);
}

/**
 * Subscribe to Firebase auth state changes.
 * If Firebase is not configured (demo mode), immediately calls callback with
 * null so the app loads without hanging on the spinner.
 * Returns an unsubscribe function.
 */
export function subscribeToAuth(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  if (!auth || !isFirebaseReady) {
    // Demo mode — no real Firebase; resolve immediately with "not signed in"
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/** Get the current user (synchronously, may be null on cold start). */
export function getCurrentUser(): FirebaseUser | null {
  return auth?.currentUser ?? null;
}
