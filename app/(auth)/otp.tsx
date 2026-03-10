import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { persistSession } from '../../src/hooks/useAuth';
import type { User } from '../../src/types';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

// TODO (Production): Replace mock auth with real Firebase Phone OTP.
// Steps:
//  1. Run: npx expo install @react-native-firebase/app @react-native-firebase/auth
//  2. Configure google-services.json (Android) and GoogleService-Info.plist (iOS)
//  3. Replace mockSignIn below with: const user = await verifyOtp(verificationId, code);

function mockSignIn(phone: string): User {
  return {
    id: `mock-${phone.replace(/\D/g, '')}`,
    phone,
    name: '',
    role: 'worker',
    status: 'active',
    language: 'ko',
    createdAt: new Date(),
  };
}

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setAppUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    try {
      // TODO (Production): replace with real Firebase OTP
      // const fbUser = await verifyOtp(verificationId, code);
      // setFirebaseUser(fbUser);

      // Demo mode: any 6-digit code is accepted
      const user = mockSignIn(phone ?? '');
      setAppUser(user);
      // Save session so the user stays logged in after restart
      await persistSession(user, false);

      router.replace('/(auth)/role');
    } catch {
      Alert.alert('', t('error.invalid_otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    Alert.alert('', t('auth.resend_success'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('auth.otp_title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otp_subtitle', { phone: phone ?? '' })}
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            placeholder={t('auth.otp_placeholder')}
            autoFocus
            textAlign="center"
          />

          {/* Visual OTP indicator dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, code.length > i && styles.dotFilled]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verifyBtn, code.length !== OTP_LENGTH && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={code.length !== OTP_LENGTH || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyBtnText}>{t('auth.verify')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResend}
            disabled={countdown > 0}
          >
            <Text
              style={[styles.resendText, countdown > 0 && styles.resendDisabled]}
            >
              {countdown > 0
                ? t('auth.resend_in', { seconds: countdown })
                : t('auth.resend')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: -8,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 12,
    backgroundColor: Colors.surface,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: -8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyBtnDisabled: {
    backgroundColor: Colors.text.disabled,
  },
  verifyBtnText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendDisabled: {
    color: Colors.text.disabled,
  },
});
