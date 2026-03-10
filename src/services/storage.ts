/**
 * Firebase Storage service — document uploads
 *
 * TODO (Production):
 *  - Move to server-side presigned URLs (S3 or Firebase Storage signed URLs).
 *  - Encrypt files before upload or use server-side encryption.
 *  - Implement strict Storage security rules: only the document owner can read.
 *  - Add virus/malware scanning on upload (e.g. via Cloud Functions).
 *  - Maintain audit log of every file access.
 *
 * MVP: Files are stored in Firebase Storage with owner-only read rules.
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';
import type { DocumentType } from '../types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadProgress {
  progress: number; // 0–100
  downloadUrl?: string;
  error?: string;
}

/**
 * Upload a document file to Firebase Storage.
 * Returns an UploadTask so callers can monitor progress.
 *
 * @param userId     - The worker's UID
 * @param docType    - Document category
 * @param fileUri    - Local file URI from expo-image-picker / expo-document-picker
 * @param mimeType   - MIME type of the file
 * @param onProgress - Progress callback
 */
export async function uploadDocument(
  userId: string,
  docType: DocumentType,
  fileUri: string,
  mimeType: string,
  onProgress: (p: UploadProgress) => void,
): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  if (blob.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }

  const ext = mimeType.split('/')[1] ?? 'bin';
  const timestamp = Date.now();
  const storagePath = `documents/${userId}/${docType}/${timestamp}.${ext}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<string>((resolve, reject) => {
    const task: UploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: mimeType,
      customMetadata: {
        uploadedBy: userId,
        docType,
        uploadedAt: new Date().toISOString(),
      },
    });

    task.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress({ progress });
      },
      (error) => {
        onProgress({ progress: 0, error: error.message });
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        onProgress({ progress: 100, downloadUrl });
        resolve(downloadUrl);
      },
    );
  });
}

/** Delete a document from storage. Only call from a trusted environment. */
export async function deleteDocument(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
