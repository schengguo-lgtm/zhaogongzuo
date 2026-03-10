import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { persistSession } from '../../src/hooks/useAuth';
import type { UserRole } from '../../src/types';

interface RoleOption {
  role: UserRole;
  emoji: string;
  labelKey: string;
  descKey: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'worker',
    emoji: '👷',
    labelKey: 'auth.role_worker',
    descKey: 'auth.role_worker',
  },
  {
    role: 'employer',
    emoji: '🏢',
    labelKey: 'auth.role_employer',
    descKey: 'auth.role_employer',
  },
  {
    role: 'both',
    emoji: '🔄',
    labelKey: 'auth.role_both',
    descKey: 'auth.role_both',
  },
];

export default function RoleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateRole, setHasCompletedOnboarding, appUser } = useAuthStore();
  const [selected, setSelected] = useState<UserRole>('worker');

  const handleContinue = async () => {
    updateRole(selected);
    setHasCompletedOnboarding(true);
    // Persist the completed onboarding + selected role before navigating away,
    // so the user's role is saved even if the app is closed immediately after.
    if (appUser) {
      try {
        await persistSession({ ...appUser, role: selected }, true);
      } catch {
        // Persistence failure is non-fatal; the in-memory state is already updated.
      }
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('auth.role_select')}</Text>
        <Text style={styles.subtitle}>{t('auth.role_subtitle')}</Text>

        <View style={styles.options}>
          {ROLE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.role}
              style={[styles.option, selected === opt.role && styles.optionSelected]}
              onPress={() => setSelected(opt.role)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected === opt.role && styles.optionLabelSelected,
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === opt.role && styles.radioSelected,
                ]}
              >
                {selected === opt.role && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>{t('common.next')} →</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'center',
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
    marginTop: -12,
  },
  options: {
    gap: 12,
    marginVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 14,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
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
