/**
 * Employer Dashboard — manage sites, jobs, and applicants.
 * MVP: shows mock data. Connect to Firestore for production.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { MOCK_SITES } from '../../src/mock/sites';
import { useAuthStore } from '../../src/store/authStore';
import type { Application, ConstructionSite } from '../../src/types';

const MOCK_EMPLOYER_APPS: (Application & { workerName: string; jobTitle: string })[] = [
  {
    id: 'emp-app-001',
    jobId: 'job-001-1',
    siteId: 'site-001',
    workerId: 'worker-111',
    employerId: 'employer-mock-1',
    status: 'pending',
    workerName: '김 ** (***-****-1234)',
    jobTitle: '철근 작업자',
    createdAt: new Date('2026-03-09'),
    updatedAt: new Date('2026-03-09'),
  },
  {
    id: 'emp-app-002',
    jobId: 'job-003-2',
    siteId: 'site-003',
    workerId: 'worker-222',
    employerId: 'employer-mock-1',
    status: 'pending',
    workerName: '이 ** (***-****-5678)',
    jobTitle: '도장 작업자',
    createdAt: new Date('2026-03-08'),
    updatedAt: new Date('2026-03-08'),
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.accent,
  rejected: Colors.danger,
  withdrawn: Colors.text.disabled,
  completed: Colors.primary,
};

export default function EmployerDashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { appUser } = useAuthStore();
  const [applications, setApplications] = useState(MOCK_EMPLOYER_APPS);

  // My sites (employer owns)
  const mySites = MOCK_SITES.filter(
    (s) => s.employerId === 'employer-mock-1',
  );

  const handleAccept = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) => a.id === appId ? { ...a, status: 'accepted', updatedAt: new Date() } : a),
    );
  };

  const handleReject = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) => a.id === appId ? { ...a, status: 'rejected', updatedAt: new Date() } : a),
    );
  };

  const handleRequestDoc = (app: typeof MOCK_EMPLOYER_APPS[0]) => {
    Alert.alert(
      t('document.auth_request'),
      `${app.workerName}의 증명서 열람을 요청합니다.`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: '요청',
          onPress: () => {
            // TODO (Production): requestDocumentAuth(docId, workerId, employerId)
            Alert.alert('✅', '열람 요청이 전송되었습니다. 구직자의 승인 후 24시간 내 열람 가능합니다.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Company verification status */}
        <View style={styles.verifyBanner}>
          <Text style={styles.verifyText}>
            🏢 {t('employer.company_status')}: ⏳ {t('profile.company_pending')}
          </Text>
          <Text style={styles.verifyHint}>
            회사 서류를 제출하면 영업일 1~3일 내 검토됩니다.
          </Text>
        </View>

        {/* My Sites */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('employer.my_sites')}</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('', '현장 추가 기능은 준비 중입니다. (MVP)')}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ {t('employer.add_site')}</Text>
            </TouchableOpacity>
          </View>
          {mySites.slice(0, 3).map((site) => (
            <TouchableOpacity
              key={site.id}
              style={styles.siteRow}
              onPress={() => router.push(`/site/${site.id}`)}
            >
              <View style={styles.siteInfo}>
                <Text style={styles.siteName} numberOfLines={1}>{site.name}</Text>
                <Text style={styles.siteJobs}>{site.jobs.length} 직종</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Applicants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('employer.applicants')} ({applications.length})
          </Text>
          {applications.map((app) => (
            <View key={app.id} style={styles.appCard}>
              <View style={styles.appHeader}>
                <Text style={styles.workerName}>{app.workerName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[app.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[app.status] }]}>
                    {t(`application.status_${app.status}` as any)}
                  </Text>
                </View>
              </View>
              <Text style={styles.appJobTitle}>{app.jobTitle}</Text>
              <Text style={styles.appDate}>{app.createdAt.toLocaleDateString()}</Text>

              {app.status === 'pending' && (
                <View style={styles.appActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(app.id)}
                  >
                    <Text style={styles.rejectBtnText}>❌ {t('application.status_rejected')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(app.id)}
                  >
                    <Text style={styles.acceptBtnText}>✅ {t('application.status_accepted')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.appSecondRow}>
                <TouchableOpacity
                  style={styles.docBtn}
                  onPress={() => handleRequestDoc(app)}
                >
                  <Text style={styles.docBtnText}>📄 증명서 열람 요청</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => router.push(`/chat/room-${app.workerId}`)}
                >
                  <Text style={styles.chatBtnText}>💬 채팅</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
    padding: 16,
    gap: 20,
  },
  verifyBanner: {
    backgroundColor: Colors.warning + '22',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.warning + '55',
  },
  verifyText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
  },
  verifyHint: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.primary + '18',
  },
  addBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  siteJobs: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: Colors.text.disabled,
  },
  appCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appJobTitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  appDate: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  appActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  appSecondRow: {
    flexDirection: 'row',
    gap: 8,
  },
  docBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docBtnText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chatBtn: {
    paddingHorizontal: 14,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  chatBtnText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
});
