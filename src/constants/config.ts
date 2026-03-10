import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const Config = {
  // Firebase
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra.firebaseApiKey ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra.firebaseAuthDomain ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra.firebaseProjectId ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra.firebaseStorageBucket ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra.firebaseMessagingSenderId ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra.firebaseAppId ?? '',
  },

  // Maps
  naverMapsClientId: process.env.EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID ?? extra.naverMapsClientId ?? '',
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',

  // Rate limiting
  maxDailyApplications: parseInt(
    process.env.EXPO_PUBLIC_MAX_DAILY_APPLICATIONS ?? '10',
    10,
  ),
  documentAuthHours: parseInt(
    process.env.EXPO_PUBLIC_DOCUMENT_AUTH_HOURS ?? '24',
    10,
  ),

  // Seoul, Korea - default map center
  defaultMapRegion: {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },

  // Platform
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
} as const;
