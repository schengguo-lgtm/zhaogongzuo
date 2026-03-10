/**
 * Document Authorization Screen
 *
 * Workers can see pending authorization requests and approve/deny them.
 * Documents are controlled with 24-hour access windows.
 *
 * TODO (Production):
 *  - Pull real DocumentAuthorization records from Firestore.
 *  - Use presigned URLs (S3 or Firebase Storage signed URLs) for secure file access.
 *  - Log every view event to the audit trail.
 *  - Enforce expiry server-side (never trust client-only expiry).
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
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { Colors } from '../src/constants/colors';
import { useAuthStore } from '../src/store/authStore';
import { useRateLimit } from '../src/hooks/useRateLimit';
import type { WorkerDocument, DocumentType } from '../src/types';

const DOC_TYPES: DocumentType[] = [
  'id_card',
  'residence_card',
  'work_permit',
  'safety_certificate',
  'skill_certificate',
];

const MOCK_DOCS: WorkerDocument[] = [
  {
    id: 'doc-001',
    workerId: 'mock-worker',
    type: 'id_card',
    fileUrl: 'https://example.com/doc1.jpg',
    status: 'approved',
    uploadedAt: new Date('2026-02-01'),
  },
  {
    id: 'doc-002',
    workerId: 'mock-worker',
    type: 'work_permit',
    fileUrl: 'https://example.com/doc2.pdf',
    status: 'pending',
    uploadedAt: new Date('2026-03-01'),
    expiresAt: new Date('2027-03-01'),
  },
];

interface PendingAuthRequest {
  id: string;
  requestedBy: string;
  docType: DocumentType;
  requestedAt: Date;
}

const MOCK_AUTH_REQUESTS: PendingAuthRequest[] = [
  {
    id: 'auth-001',
    requestedBy: '강남 파크뷰 고용주',
    docType: 'id_card',
    requestedAt: new Date('2026-03-09T10:00:00'),
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  approved: Colors.accent,
  rejected: Colors.danger,
  expired: Colors.text.disabled,
};

export default function DocumentAuthScreen() {
  const { t } = useTranslation();
  const { appUser } = useAuthStore();
  const { consumeToken } = useRateLimit();
  const [docs, setDocs] = useState<WorkerDocument[]>(MOCK_DOCS);
  const [authRequests, setAuthRequests] = useState<PendingAuthRequest[]>(MOCK_AUTH_REQUESTS);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (docType: DocumentType) => {
    const allowed = await consumeToken('uploadDocument');
    if (!allowed) {
      Alert.alert('', '오늘 업로드 한도에 도달했습니다.');
      return;
    }

    Alert.alert('업로드 방법 선택', '', [
      {
        text: '📷 카메라',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('', t('error.permission_denied'));
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            await processUpload(docType, result.assets[0].uri, 'image/jpeg');
          }
        },
      },
      {
        text: '🖼 갤러리',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            await processUpload(docType, result.assets[0].uri, 'image/jpeg');
          }
        },
      },
      {
        text: '📄 파일 선택',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
            copyToCacheDirectory: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            await processUpload(docType, asset.uri, asset.mimeType ?? 'application/octet-stream');
          }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const processUpload = async (
    docType: DocumentType,
    uri: string,
    mimeType: string,
  ) => {
    setUploading(docType);
    try {
      // TODO (Production): Replace with real uploadDocument() from storage service
      // const url = await uploadDocument(appUser.id, docType, uri, mimeType, (p) => {
      //   console.log('Upload progress:', p.progress);
      // });

      // MVP mock: simulate upload delay
      await new Promise((r) => setTimeout(r, 1500));
      const mockUrl = `mock://docs/${docType}/${Date.now()}`;

      const newDoc: WorkerDocument = {
        id: `doc-${Date.now()}`,
        workerId: appUser?.id ?? '',
        type: docType,
        fileUrl: mockUrl,
        status: 'pending',
        uploadedAt: new Date(),
      };
      setDocs((prev) => {
        const without = prev.filter((d) => d.type !== docType);
        return [...without, newDoc];
      });
      Alert.alert('✅', '업로드 완료. 검토 후 승인됩니다.');
    } catch {
      Alert.alert('', t('error.upload_failed'));
    } finally {
      setUploading(null);
    }
  };

  const handleAuthApprove = (authId: string) => {
    // TODO (Production): approveDocumentAuth(authId, appUser.id)
    setAuthRequests((prev) => prev.filter((r) => r.id !== authId));
    Alert.alert('✅', t('document.auth_approved'));
  };

  const handleAuthDeny = (authId: string) => {
    setAuthRequests((prev) => prev.filter((r) => r.id !== authId));
    Alert.alert('', t('document.auth_denied'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Pending auth requests */}
        {authRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔔 {t('document.auth_request')} ({authRequests.length})
            </Text>
            {authRequests.map((req) => (
              <View key={req.id} style={styles.authCard}>
                <Text style={styles.authBody}>
                  {t('document.auth_body', {
                    employer: req.requestedBy,
                    docType: t(`document.${req.docType}` as any),
                  })}
                </Text>
                <Text style={styles.authExpire}>
                  {t('document.auth_expire', { hours: 24 })}
                </Text>
                <View style={styles.authActions}>
                  <TouchableOpacity
                    style={styles.denyBtn}
                    onPress={() => handleAuthDeny(req.id)}
                  >
                    <Text style={styles.denyBtnText}>{t('document.auth_deny')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleAuthApprove(req.id)}
                  >
                    <Text style={styles.approveBtnText}>{t('document.auth_approve')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Document list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('document.title')}</Text>
          {DOC_TYPES.map((type) => {
            const doc = docs.find((d) => d.type === type);
            const isUploading = uploading === type;

            return (
              <View key={type} style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docType}>{t(`document.${type}` as any)}</Text>
                  {doc ? (
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[doc.status] + '22' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[doc.status] }]}>
                        {t(`document.status_${doc.status}` as any)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noDoc}>미업로드</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
                  onPress={() => handleUpload(type)}
                  disabled={isUploading || !!uploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.uploadBtnText}>
                      {doc ? '재업로드' : t('document.upload')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text style={styles.tip}>💡 {t('document.upload_tip')}</Text>
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
  authCard: {
    backgroundColor: Colors.warning + '18',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  authBody: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  authExpire: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  authActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  denyBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
  },
  denyBtnText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  approveBtnText: {
    color: Colors.text.inverse,
    fontSize: 13,
    fontWeight: '700',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docInfo: {
    flex: 1,
    gap: 4,
  },
  docType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noDoc: {
    fontSize: 12,
    color: Colors.text.disabled,
  },
  uploadBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 72,
    alignItems: 'center',
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  tip: {
    fontSize: 12,
    color: Colors.text.disabled,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
