/**
 * Root layout — initializes i18n, restores session from AsyncStorage,
 * and handles navigation between auth and main app flows.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../src/hooks/useAuth';
import { useAuthStore } from '../src/store/authStore';
import { getStoredLanguage, initI18n } from '../src/i18n';
import { useAppStore } from '../src/store/appStore';
import { Colors } from '../src/constants/colors';
import '../src/i18n'; // side-effect: registers i18n resources

// Keep the splash screen until we're ready
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, isAuthenticated } = useAuth();
  const { hasCompletedOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until session restore + Firebase check is done
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in — send to language/login
      router.replace('/(auth)/language');
    } else if (isAuthenticated && hasCompletedOnboarding && inAuthGroup) {
      // Fully authenticated and onboarded — go to main app
      router.replace('/(tabs)');
    } else if (isAuthenticated && !hasCompletedOnboarding && !inAuthGroup) {
      // Logged in but hasn't chosen a role yet
      router.replace('/(auth)/role');
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="site/[id]"
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: '',
          headerTintColor: Colors.primary,
        }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: '',
          headerTintColor: Colors.primary,
        }}
      />
      <Stack.Screen
        name="document-auth"
        options={{
          headerShown: true,
          title: '',
          presentation: 'modal',
          headerTintColor: Colors.primary,
        }}
      />
      <Stack.Screen
        name="disclaimer"
        options={{
          headerShown: true,
          title: '',
          presentation: 'modal',
          headerTintColor: Colors.primary,
        }}
      />
      <Stack.Screen
        name="employer/dashboard"
        options={{
          headerShown: true,
          title: '',
          headerTintColor: Colors.primary,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const { setLanguage } = useAppStore();

  useEffect(() => {
    async function prepare() {
      const lang = await getStoredLanguage();
      initI18n(lang);
      setLanguage(lang);
      setI18nReady(true);
      await SplashScreen.hideAsync();
    }
    prepare().catch(console.error);
  }, [setLanguage]);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <RootLayoutNav />
    </>
  );
}
