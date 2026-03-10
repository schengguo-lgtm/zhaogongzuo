/**
 * Jobs/Applications Tab — workers see their applications; employers manage applicants.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import type { Application } from '../../src/types';

// MVP: use local mock state; replace with Firestore in production
const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    jobId: 'job-001-1',
    siteId: 'site-001',
    workerId: 'mock-worker',
    employerId: 'employer-mock-1',
    status: 'pending',
    message: '철근 작업 3년 경력 있습니다.',
    createdAt: new Date('2026-03-08'),
    updatedAt: new Date('2026-03-08'),
  },
  {
    id: 'app-002',
    jobId: 'job-003-1',
    siteId: 'site-003',
    workerId: 'mock-worker',
    employerId: 'employer-mock-1',
    status: 'accepted',
    createdAt: new Date('2026-03-07'),
    updatedAt: new Date('2026-03-09'),
  },
];

const STATUS_COLORS: Record<Application['status'], string> = {
  pending: Colors.warning,
  accepted: Colors.accent,
  rejected: Colors.danger,
  withdrawn: Colors.text.disabled,
  completed: Colors.primary,
};

const JOB_TITLES: Record<string, string> = {
  'job-001-1': '철근 작업자 — 강남 파크뷰',
  'job-003-1': '전기 공사 — 송파 복합쇼핑몰',
};

export default function JobsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { appUser } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'worker' | 'employer'>(
    appUser?.role === 'employer' ? 'employer' : 'worker',
  );

  const handleWithdraw = (appId: string) => {
    Alert.alert(t('application.withdraw'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => {
          setApplications((prev) =>
            prev.map((a) =>
              a.id === appId ? { ...a, status: 'withdrawn', updatedAt: new Date() } : a,
            ),
          );
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Application }) => {
    const statusColor = STATUS_COLORS[item.status];
    const statusLabel = t(`application.status_${item.status}` as any);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {JOB_TITLES[item.jobId] ?? item.jobId}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {item.message ? (
          <Text style={styles.message} numberOfLines={2}>
            "{item.message}"
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.date}>
            {item.createdAt.toLocaleDateString()}
          </Text>
          {item.status === 'pending' && (
            <TouchableOpacity
              onPress={() => handleWithdraw(item.id)}
              style={styles.withdrawBtn}
            >
              <Text style={styles.withdrawText}>{t('application.withdraw')}</Text>
            </TouchableOpacity>
          )}
          {item.status === 'accepted' && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => router.push(`/chat/${item.employerId}`)}
            >
              <Text style={styles.chatBtnText}>💬 채팅</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const canSeeEmployer = appUser?.role === 'employer' || appUser?.role === 'both';

  return (
    <SafeAreaView style={styles.safe}>
      {canSeeEmployer && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'worker' && styles.tabActive]}
            onPress={() => setActiveTab('worker')}
          >
            <Text style={[styles.tabText, activeTab === 'worker' && styles.tabTextActive]}>
              {t('application.tab_worker')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'employer' && styles.tabActive]}
            onPress={() => setActiveTab('employer')}
          >
            <Text style={[styles.tabText, activeTab === 'employer' && styles.tabTextActive]}>
              {t('application.tab_employer')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : activeTab === 'worker' ? (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>{t('application.no_applications')}</Text>
            </View>
          }
        />
      ) : (
        // Employer view — redirect to dashboard
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏢</Text>
          <TouchableOpacity
            style={styles.dashBtn}
            onPress={() => router.push('/employer/dashboard')}
          >
            <Text style={styles.dashBtnText}>{t('employer.dashboard')} →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  list: {
    padding: 14,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  withdrawBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  withdrawText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },
  chatBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  chatBtnText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
  },
  dashBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  dashBtnText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});
