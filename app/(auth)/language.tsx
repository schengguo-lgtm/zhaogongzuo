import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { useAppStore } from '../../src/store/appStore';
import type { SupportedLanguage } from '../../src/i18n';

export default function LanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage } = useAppStore();

  const handleSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.emoji}>🏗️</Text>
          <Text style={styles.title}>{t('language.select_title')}</Text>
          <Text style={styles.subtitle}>{t('language.select_subtitle')}</Text>
        </View>

        <LanguageSelector
          current={language}
          onSelect={handleSelect}
          style={styles.selector}
        />

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.continueBtnText}>{t('common.next')} →</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    gap: 24,
  },
  top: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  selector: {
    marginVertical: 8,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnText: {
    color: Colors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
  },
});
