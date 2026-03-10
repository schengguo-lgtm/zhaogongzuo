/**
 * Site Detail — shows all jobs at a construction site with apply buttons.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { getSiteById } from '../../src/mock/sites';
import { JobCard } from '../../src/components/JobCard';
import { useAuthStore } from '../../src/store/authStore';
import { useRateLimit } from '../../src/hooks/useRateLimit';
import { Config } from '../../src/constants/config';
import { formatDistance } from '../../src/utils/geo';
import { useEffect } from 'react';

export default function SiteDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { appUser } = useAuthStore();
  const { consumeToken, getRemainingTokens } = useRateLimit();
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [remainingApps, setRemainingApps] = useState<number>(Config.maxDailyApplications);

  const site = getSiteById(id ?? '');

  useEffect(() => {
    if (site) {
      navigation.setOptions({ title: site.name });
    }
    // Load remaining applications
    getRemainingTokens('apply').then(setRemainingApps).catch(console.error);
  }, [site, navigation, getRemainingTokens]);

  if (!site) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>현장을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleApply = async (jobId: string) => {
    if (appliedJobs.has(jobId)) return;

    Alert.alert(
      t('application.apply_title'),
      site.name,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.apply'),
          onPress: async () => {
            const allowed = await consumeToken('apply');
            if (!allowed) {
              Alert.alert(
                '',
                t('application.limit_reached', { max: Config.maxDailyApplications }),
              );
              return;
            }
            // TODO (Production): submitApplication(jobId, site.id, appUser.id, site.employerId)
            setAppliedJobs((prev) => new Set([...prev, jobId]));
            setRemainingApps((prev) => Math.max(0, prev - 1));
            Alert.alert('✅', t('application.success'));
          },
        },
      ],
    );
  };

  const handleCall = () => {
    const url = `tel:${site.contactPhone.replace(/[^0-9+]/g, '')}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('', '전화를 걸 수 없습니다.'),
    );
  };

  const handleDirections = () => {
    const query = encodeURIComponent(site.address);
    const url = `https://map.naver.com/v5/search/${query}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('', '지도 앱을 열 수 없습니다.'),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Site header */}
        <View style={styles.header}>
          <Text style={styles.siteName}>{site.name}</Text>
          <Text style={styles.address}>📍 {site.address}</Text>
          {site.distanceKm !== undefined && (
            <Text style={styles.distance}>
              {formatDistance(site.distanceKm)}
            </Text>
          )}
        </View>

        {/* Description */}
        {site.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('site.description')}</Text>
            <Text style={styles.description}>{site.description}</Text>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Text style={styles.callBtnText}>📞 {t('common.call')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dirBtn} onPress={handleDirections}>
            <Text style={styles.dirBtnText}>🗺 {t('site.directions')}</Text>
          </TouchableOpacity>
        </View>

        {/* Rate limit indicator */}
        <View style={styles.rateHint}>
          <Text style={styles.rateHintText}>
            📊 오늘 남은 지원 횟수: {remainingApps}/{Config.maxDailyApplications}
          </Text>
        </View>

        {/* Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('site.jobs')} ({site.jobs.length})
          </Text>
          {site.jobs.length === 0 ? (
            <Text style={styles.noJobs}>{t('site.no_jobs')}</Text>
          ) : (
            site.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={() => handleApply(job.id)}
                applied={appliedJobs.has(job.id)}
              />
            ))
          )}
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
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  siteName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  address: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  distance: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  callBtnText: {
    color: Colors.text.inverse,
    fontSize: 15,
    fontWeight: '700',
  },
  dirBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dirBtnText: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  rateHint: {
    backgroundColor: Colors.secondary + '22',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  rateHintText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  noJobs: {
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
