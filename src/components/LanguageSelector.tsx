import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import { setStoredLanguage, type SupportedLanguage } from '../i18n';

interface LanguageSelectorProps {
  current: SupportedLanguage;
  onSelect: (lang: SupportedLanguage) => void;
  compact?: boolean;
  style?: ViewStyle;
}

const LANGS: { code: SupportedLanguage; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  current,
  onSelect,
  compact = false,
  style,
}) => {
  const { i18n } = useTranslation();

  const handleSelect = async (lang: SupportedLanguage) => {
    await setStoredLanguage(lang);
    onSelect(lang);
  };

  if (compact) {
    return (
      <View style={[styles.compactRow, style]}>
        {LANGS.map((l) => (
          <TouchableOpacity
            key={l.code}
            onPress={() => handleSelect(l.code)}
            style={[
              styles.compactBtn,
              i18n.language === l.code && styles.compactBtnActive,
            ]}
          >
            <Text
              style={[
                styles.compactLabel,
                i18n.language === l.code && styles.compactLabelActive,
              ]}
            >
              {l.flag} {l.code.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.column, style]}>
      {LANGS.map((l) => (
        <TouchableOpacity
          key={l.code}
          onPress={() => handleSelect(l.code)}
          style={[styles.langBtn, i18n.language === l.code && styles.langBtnActive]}
        >
          <Text style={styles.flag}>{l.flag}</Text>
          <Text
            style={[
              styles.langLabel,
              i18n.language === l.code && styles.langLabelActive,
            ]}
          >
            {l.label}
          </Text>
          {i18n.language === l.code && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    gap: 12,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  langBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  flag: {
    fontSize: 28,
  },
  langLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  langLabelActive: {
    color: Colors.primary,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  // compact
  compactRow: {
    flexDirection: 'row',
    gap: 6,
  },
  compactBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  compactLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  compactLabelActive: {
    color: Colors.text.inverse,
  },
});
