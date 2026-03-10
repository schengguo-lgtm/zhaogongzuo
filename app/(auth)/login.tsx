import React, { useState, useRef } from 'react';
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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { useAppStore } from '../../src/store/appStore';
import { useRateLimit } from '../../src/hooks/useRateLimit';
import type { SupportedLanguage } from '../../src/i18n';

// NOTE: Real OTP is sent via Firebase Auth.
// For Expo Go / web preview: we use a mock flow (any 6-digit code works).
// TODO: Wire up initRecaptcha + sendOtp from src/services/auth.ts for production.

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage } = useAppStore();
  const { consumeToken } = useRateLimit();
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidPhone = phone.replace(/\D/g, '').length >= 9;

  const handleSendCode = async () => {
    if (!isValidPhone) {
      Alert.alert('', t('error.invalid_phone'));
      return;
    }
    if (!agreed) {
      Alert.alert('', t('auth.agree_terms'));
      return;
    }

    setLoading(true);
    try {
      const allowed = await consumeToken('sendOtp');
      if (!allowed) {
        Alert.alert('', '하루 최대 5회까지 인증 코드를 요청할 수 있습니다.');
        return;
      }

      // TODO (Production): Replace with real Firebase sendOtp()
      // const verificationId = await sendOtp(phone);
      // router.push({ pathname: '/(auth)/otp', params: { phone, verificationId } });

      // MVP mock: navigate with phone
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err) {
      Alert.alert('', t('error.auth_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Language selector top-right */}
          <LanguageSelector
            current={language}
            onSelect={(lang: SupportedLanguage) => setLanguage(lang)}
            compact
            style={styles.langRow}
          />

          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🏗️</Text>
            <Text style={styles.heroTitle}>{t('common.appName')}</Text>
            <Text style={styles.heroSub}>건설 현장 구인·구직 플랫폼</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('auth.login_title')}</Text>
            <Text style={styles.cardSub}>{t('auth.login_subtitle')}</Text>

            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('auth.phone_placeholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <Text style={styles.termsText}>{t('auth.agree_terms')} </Text>
              <TouchableOpacity
                onPress={() => router.push('/disclaimer')}
              >
                <Text style={styles.termsLink}>{t('auth.view_terms')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!isValidPhone || !agreed || loading) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendCode}
              disabled={!isValidPhone || !agreed || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendBtnText}>{t('auth.send_code')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    padding: 24,
    gap: 20,
  },
  langRow: {
    alignSelf: 'flex-end',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  heroEmoji: {
    fontSize: 52,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  cardSub: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: -8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  termsLink: {
    fontSize: 13,
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.text.disabled,
  },
  sendBtnText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});
