import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { setStoredLanguage, type SupportedLanguage } from '../../src/i18n';
import { useAppStore } from '../../src/store/appStore';
import { signOut } from '../../src/services/auth';
import { clearSession } from '../../src/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  worker: '👷 구직자',
  employer: '🏢 고용주',
  both: '🔄 구직자 + 고용주',
};

const COMPANY_STATUS_LABELS: Record<string, string> = {
  pending: '⏳ 검토 중',
  approved: '✅ 승인됨',
  rejected: '❌ 반려됨',
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { appUser, reset } = useAuthStore();
  const { language, setLanguage } = useAppStore();

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            // already signed out from Firebase
          }
          // Clear persisted session from AsyncStorage
          await clearSession().catch(console.error);
          reset();
          router.replace('/(auth)/language');
        },
      },
    ]);
  };

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await setStoredLanguage(lang);
    setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {appUser?.name?.charAt(0) ?? '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{appUser?.name || appUser?.phone || '—'}</Text>
          <Text style={styles.userPhone}>{appUser?.phone ?? ''}</Text>
          <Text style={styles.userRole}>
            {ROLE_LABELS[appUser?.role ?? 'worker'] ?? appUser?.role}
          </Text>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <LanguageSelector
            current={language}
            onSelect={handleLanguageChange}
          />
        </View>

        {/* Documents */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/document-auth')}
        >
          <Text style={styles.menuEmoji}>📄</Text>
          <Text style={styles.menuLabel}>{t('profile.documents')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Company verification (employers) */}
        {(appUser?.role === 'employer' || appUser?.role === 'both') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.company')}</Text>
            <View style={styles.companyCard}>
              <Text style={styles.companyStatus}>
                {COMPANY_STATUS_LABELS.pending}
              </Text>
              <Text style={styles.companyHint}>
                {t('profile.company_pending')} — 영업일 1–3일 소요
              </Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() =>
                  Alert.alert('', '회사 서류 업로드 기능은 준비 중입니다. (MVP)')
                }
              >
                <Text style={styles.uploadBtnText}>
                  📎 {t('profile.company_verify')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Employer dashboard shortcut */}
        {(appUser?.role === 'employer' || appUser?.role === 'both') && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/employer/dashboard')}
          >
            <Text style={styles.menuEmoji}>🏢</Text>
            <Text style={styles.menuLabel}>{t('employer.dashboard')}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Disclaimer */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/disclaimer')}
        >
          <Text style={styles.menuEmoji}>⚖️</Text>
          <Text style={styles.menuLabel}>{t('disclaimer.title')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
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
    padding: 20,
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: Colors.text.inverse,
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  userRole: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  menuEmoji: {
    fontSize: 22,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.text.disabled,
  },
  companyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  companyStatus: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.warning,
  },
  companyHint: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  uploadBtn: {
    backgroundColor: Colors.surfaceAlt,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  logoutBtn: {
    backgroundColor: Colors.danger + '18',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
