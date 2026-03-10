import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ko from './ko';
import zh from './zh';
import en from './en';

export const LANGUAGES = ['ko', 'zh', 'en'] as const;
export type SupportedLanguage = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = '@zhaogongzuo/language';

const resources = {
  ko: { translation: ko },
  zh: { translation: zh },
  en: { translation: en },
} as const;

export async function getStoredLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // ignore storage errors
  }
  return 'ko'; // default
}

export async function setStoredLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export function initI18n(initialLanguage: SupportedLanguage = 'ko'): void {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'ko',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
    })
    .catch(console.error);
}

export default i18n;
