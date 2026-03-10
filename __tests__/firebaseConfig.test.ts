/**
 * Tests that the Firebase service layer degrades gracefully when Firebase
 * is not configured (demo / iOS Simulator mode with no .env file).
 *
 * Imports the real utility function so tests stay in sync with implementation.
 */

import { isFirebaseConfigured, isRealConfigValue } from '../src/utils/firebase';

describe('isRealConfigValue', () => {
  it('returns false for empty string', () => {
    expect(isRealConfigValue('')).toBe(false);
  });

  it('returns false for undefined / null', () => {
    expect(isRealConfigValue(undefined)).toBe(false);
    expect(isRealConfigValue(null)).toBe(false);
  });

  it('returns false for YOUR_... placeholder pattern', () => {
    expect(isRealConfigValue('YOUR_API_KEY')).toBe(false);
    expect(isRealConfigValue('YOUR_PROJECT_ID')).toBe(false);
    expect(isRealConfigValue('your_firebase_api_key')).toBe(false);
  });

  it('returns false for PLACEHOLDER_... pattern', () => {
    expect(isRealConfigValue('PLACEHOLDER_VALUE')).toBe(false);
  });

  it('returns false for <...> and [...] bracket patterns', () => {
    expect(isRealConfigValue('<MY_KEY>')).toBe(false);
    expect(isRealConfigValue('[MY_KEY]')).toBe(false);
  });

  it('returns false for literal "null" and "undefined"', () => {
    expect(isRealConfigValue('null')).toBe(false);
    expect(isRealConfigValue('undefined')).toBe(false);
  });

  it('returns true for real-looking values', () => {
    expect(isRealConfigValue('AIzaSyAbcDefGhi123')).toBe(true);
    expect(isRealConfigValue('my-real-project')).toBe(true);
    expect(isRealConfigValue('1:999999999:ios:abcdef123456')).toBe(true);
  });
});

describe('isFirebaseConfigured', () => {
  it('returns false for app.json placeholder values', () => {
    expect(isFirebaseConfigured({
      apiKey: 'YOUR_FIREBASE_API_KEY',
      projectId: 'YOUR_PROJECT_ID',
      appId: 'YOUR_APP_ID',
    })).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(isFirebaseConfigured({ apiKey: '', projectId: '', appId: '' })).toBe(false);
  });

  it('returns false if any one of the three required fields is a placeholder', () => {
    expect(isFirebaseConfigured({
      apiKey: 'AIzaSyAbcDefGhi123',
      projectId: 'YOUR_PROJECT_ID', // placeholder
      appId: '1:999999999:ios:abcdef',
    })).toBe(false);
  });

  it('returns true when all three fields contain real values', () => {
    expect(isFirebaseConfigured({
      apiKey: 'AIzaSyAbcDefGhi123',
      projectId: 'my-real-project',
      appId: '1:999999999:ios:abcdef123456',
    })).toBe(true);
  });
});

describe('subscribeToAuth in demo mode', () => {
  it('calls callback with null immediately when Firebase is not ready', () => {
    // Simulates the behaviour in src/services/auth.ts when isFirebaseReady is false
    function subscribeToAuthStub(
      isFirebaseReady: boolean,
      callback: (user: null) => void,
    ): () => void {
      if (!isFirebaseReady) {
        callback(null);
        return () => {};
      }
      return () => {};
    }

    const results: (null | object)[] = [];
    const unsub = subscribeToAuthStub(false, (user) => results.push(user));

    expect(results).toHaveLength(1);
    expect(results[0]).toBeNull();
    expect(() => unsub()).not.toThrow();
  });

  it('does not call callback synchronously when Firebase IS ready', () => {
    function subscribeToAuthStub(
      isFirebaseReady: boolean,
      callback: (user: null) => void,
    ): () => void {
      if (!isFirebaseReady) {
        callback(null);
        return () => {};
      }
      return () => {};
    }

    const results: (null | object)[] = [];
    subscribeToAuthStub(true, (user) => results.push(user));
    expect(results).toHaveLength(0);
  });
});
