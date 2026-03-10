import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  siteName?: string;
  onApply: () => void;
  applied?: boolean;
}

const JOB_TYPE_EMOJIS: Record<string, string> = {
  concrete: '🏗️',
  steel: '⚙️',
  carpentry: '🪚',
  painting: '🎨',
  electrical: '⚡',
  plumbing: '🔧',
  scaffolding: '🏛️',
  demolition: '💥',
  general_labor: '👷',
  crane_operator: '🏗️',
  surveyor: '📐',
  safety_officer: '🦺',
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  siteName,
  onApply,
  applied = false,
}) => {
  const { t } = useTranslation();
  const spotsLeft = job.headcount - job.filledCount;
  const isFull = spotsLeft <= 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>
          {JOB_TYPE_EMOJIS[job.jobType] ?? '👷'}
        </Text>
        <View style={styles.info}>
          <Text style={styles.title}>{job.title}</Text>
          {siteName && (
            <Text style={styles.site} numberOfLines={1}>
              {siteName}
            </Text>
          )}
          <Text style={styles.time}>
            ⏰ {job.startTime} – {job.endTime}
          </Text>
        </View>
        <View style={styles.wageBlock}>
          <Text style={styles.wage}>
            ₩{job.dailyWage.toLocaleString()}
          </Text>
          <Text style={styles.wageLabel}>{t('common.daily_wage')}</Text>
        </View>
      </View>

      {job.requirements.length > 0 && (
        <View style={styles.reqRow}>
          {job.requirements.slice(0, 2).map((r, i) => (
            <View key={i} style={styles.reqTag}>
              <Text style={styles.reqText} numberOfLines={1}>
                {r}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.spots, isFull && styles.spotsRed]}>
          {isFull
            ? t('common.full')
            : `${t('common.headcount')}: ${job.filledCount}/${job.headcount}`}
        </Text>
        <TouchableOpacity
          style={[
            styles.applyBtn,
            (isFull || applied) && styles.applyBtnDisabled,
          ]}
          onPress={onApply}
          disabled={isFull || applied}
        >
          <Text style={styles.applyBtnText}>
            {applied ? '✓ Applied' : t('common.apply')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  emoji: {
    fontSize: 28,
    marginTop: 2,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  site: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  time: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  wageBlock: {
    alignItems: 'flex-end',
  },
  wage: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  wageLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  reqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reqTag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 160,
  },
  reqText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spots: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  spotsRed: {
    color: Colors.danger,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnDisabled: {
    backgroundColor: Colors.text.disabled,
  },
  applyBtnText: {
    color: Colors.text.inverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
