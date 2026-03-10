/**
 * Firebase initialization
 *
 * Gracefully handles the case where Firebase is not yet configured (e.g. when
 * running a demo in the iOS Simulator without a real Firebase project). All
 * exports are nullable; downstream services must check before using them.
 *
 * TODO (Production):
 *  1. Replace placeholder config values with real ones from your Firebase project.
 *  2. Enable App Check for additional security.
 *  3. Set strict Firestore security rules (never allow open read/write).
 *  4. Use Firebase App Hosting or a server-side proxy for sensitive operations.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Config } from '../constants/config';
import { isFirebaseConfigured } from '../utils/firebase';

const firebaseConfig = {
  apiKey: Config.firebase.apiKey,
  authDomain: Config.firebase.authDomain,
  projectId: Config.firebase.projectId,
  storageBucket: Config.firebase.storageBucket,
  messagingSenderId: Config.firebase.messagingSenderId,
  appId: Config.firebase.appId,
};

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured(firebaseConfig)) return null;
  try {
    if (getApps().length === 0) {
      return initializeApp(firebaseConfig);
    }
    return getApp();
  } catch (err) {
    console.warn('[Firebase] Initialization failed:', err);
    return null;
  }
}

export const firebaseApp: FirebaseApp | null = getFirebaseApp();
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;
export const isFirebaseReady: boolean = !!firebaseApp;
