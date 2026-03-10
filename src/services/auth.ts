/**
 * Firebase Auth service — Phone/OTP authentication
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
import { auth } from './firebase';

// NOTE: RecaptchaVerifier is web-only. For React Native / Expo use
// @react-native-firebase/auth with phone sign-in instead.
// This file is a structural placeholder that shows the intended API.

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize invisible reCAPTCHA (web-only).
 * For React Native use @react-native-firebase/auth directly.
 */
export function initRecaptcha(containerId: string): void {
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
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Subscribe to auth state changes. Returns unsubscribe fn. */
export function subscribeToAuth(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Get the current user (synchronously, may be null on cold start). */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
