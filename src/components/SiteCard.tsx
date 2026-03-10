import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import type { ConstructionSite } from '../types';
import { getSiteAvailabilityStatus } from '../mock/sites';

interface SiteCardProps {
  site: ConstructionSite;
  onPress: () => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site, onPress }) => {
  const { t } = useTranslation();
  const availability = getSiteAvailabilityStatus(site);
  const minWage = Math.min(...site.jobs.map((j) => j.dailyWage));
  const openJobs = site.jobs.filter((j) => j.filledCount < j.headcount).length;

  const statusColor =
    availability === 'available'
      ? Colors.accent
      : availability === 'limited'
      ? Colors.warning
      : Colors.danger;

  const statusLabel =
    availability === 'available'
      ? t('common.available')
      : availability === 'limited'
      ? t('common.limited')
      : t('common.full');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.statusLabel}>{statusLabel}</Text>
        {site.distanceKm !== undefined && (
          <Text style={styles.distance}>
            {site.distanceKm < 1
              ? `${Math.round(site.distanceKm * 1000)}m`
              : `${site.distanceKm.toFixed(1)}km`}
          </Text>
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {site.name}
      </Text>
      <Text style={styles.address} numberOfLines={1}>
        📍 {site.address}
      </Text>

      <View style={styles.footer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {t('map.job_count', { count: openJobs })}
          </Text>
        </View>
        <Text style={styles.wage}>
          {t('map.wage_from', { wage: minWage.toLocaleString() })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  address: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  wage: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
