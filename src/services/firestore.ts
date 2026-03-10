/**
 * Firestore service — chat messages, applications, document authorizations
 *
 * TODO (Production):
 *  - Set strict Firestore security rules.
 *  - Use server-side Cloud Functions for sensitive writes (document auth).
 *  - Encrypt PII fields before writing to Firestore.
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ChatMessage, ChatRoom, Application, DocumentAuthorization } from '../types';

// ─── Chat ─────────────────────────────────────────────────────────────────────

/** Get or create a chat room between two users for a given job. */
export async function getOrCreateChatRoom(
  user1Id: string,
  user2Id: string,
  jobId?: string,
  siteId?: string,
): Promise<string> {
  const participants = [user1Id, user2Id].sort();
  const roomsRef = collection(db, 'chatRooms');
  const q = query(
    roomsRef,
    where('participants', '==', participants),
    where('jobId', '==', jobId ?? null),
    limit(1),
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id;
  }
  const newRoom = await addDoc(roomsRef, {
    participants,
    jobId: jobId ?? null,
    siteId: siteId ?? null,
    createdAt: serverTimestamp(),
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
  });
  return newRoom.id;
}

/** Send a chat message. */
export async function sendMessage(
  roomId: string,
  senderId: string,
  text: string,
): Promise<void> {
  const batch = writeBatch(db);
  const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
  const msgRef = doc(messagesRef);
  batch.set(msgRef, {
    senderId,
    text: text.trim(),
    sentAt: serverTimestamp(),
    readAt: null,
  });
  const roomRef = doc(db, 'chatRooms', roomId);
  batch.update(roomRef, {
    lastMessage: text.trim(),
    lastMessageAt: serverTimestamp(),
  });
  await batch.commit();
}

/** Subscribe to messages in a room (real-time). */
export function subscribeToMessages(
  roomId: string,
  onMessages: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'chatRooms', roomId, 'messages'),
    orderBy('sentAt', 'asc'),
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const msgs: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      roomId,
      senderId: d.data().senderId as string,
      text: d.data().text as string,
      sentAt: (d.data().sentAt as Timestamp)?.toDate() ?? new Date(),
      readAt: (d.data().readAt as Timestamp | null)?.toDate(),
    }));
    onMessages(msgs);
  });
}

/** Subscribe to all chat rooms for a user. */
export function subscribeToChatRooms(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const rooms: ChatRoom[] = snap.docs.map((d) => ({
      id: d.id,
      participants: d.data().participants as string[],
      jobId: d.data().jobId as string | undefined,
      siteId: d.data().siteId as string | undefined,
      lastMessage: d.data().lastMessage as string | undefined,
      lastMessageAt: (d.data().lastMessageAt as Timestamp | null)?.toDate(),
      unreadCount: (d.data().unreadCount as number) ?? 0,
    }));
    onRooms(rooms);
  });
}

// ─── Document Authorization ───────────────────────────────────────────────────

/**
 * Create a document access request.
 * The worker must then approve it via approveDocumentAuth().
 */
export async function requestDocumentAuth(
  documentId: string,
  workerId: string,
  requestedBy: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'documentAuthorizations'), {
    documentId,
    workerId,
    requestedBy,
    isActive: false,
    authorizedAt: null,
    expiresAt: null,
    auditLog: [
      {
        timestamp: serverTimestamp(),
        action: 'requested',
        actorId: requestedBy,
      },
    ],
  });
  return ref.id;
}

/**
 * Worker approves the access request.
 * Sets a 24-hour expiry window.
 */
export async function approveDocumentAuth(authId: string, workerId: string): Promise<void> {
  const ref = doc(db, 'documentAuthorizations', authId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Authorization not found');
  const data = snap.data();
  if (data.workerId !== workerId) throw new Error('Not authorized to approve');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await updateDoc(ref, {
    isActive: true,
    authorizedAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    auditLog: [
      ...(data.auditLog as AuditLogEntry[]),
      {
        timestamp: Timestamp.fromDate(now),
        action: 'authorized',
        actorId: workerId,
      },
    ],
  });
}

/** Check if an authorization is still valid. */
export async function checkDocumentAuth(authId: string): Promise<DocumentAuthorization | null> {
  const snap = await getDoc(doc(db, 'documentAuthorizations', authId));
  if (!snap.exists()) return null;
  const d = snap.data();
  const expiresAt = (d.expiresAt as Timestamp | null)?.toDate();
  const isExpired = expiresAt ? expiresAt < new Date() : true;
  if (isExpired && d.isActive) {
    // Auto-expire
    await updateDoc(doc(db, 'documentAuthorizations', authId), { isActive: false });
  }
  return {
    id: snap.id,
    documentId: d.documentId as string,
    workerId: d.workerId as string,
    requestedBy: d.requestedBy as string,
    authorizedAt: (d.authorizedAt as Timestamp | null)?.toDate(),
    expiresAt,
    isActive: d.isActive as boolean && !isExpired,
    auditLog: [],
  };
}

// ─── Applications ─────────────────────────────────────────────────────────────

/** Submit a job application. */
export async function submitApplication(
  jobId: string,
  siteId: string,
  workerId: string,
  employerId: string,
  message?: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    jobId,
    siteId,
    workerId,
    employerId,
    status: 'pending',
    message: message ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get applications for a worker. */
export async function getWorkerApplications(workerId: string): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    jobId: d.data().jobId as string,
    siteId: d.data().siteId as string,
    workerId: d.data().workerId as string,
    employerId: d.data().employerId as string,
    status: d.data().status as Application['status'],
    message: d.data().message as string | undefined,
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (d.data().updatedAt as Timestamp)?.toDate() ?? new Date(),
  }));
}

/** Get applications for an employer's jobs. */
export async function getEmployerApplications(employerId: string): Promise<Application[]> {
  const q = query(
    collection(db, 'applications'),
    where('employerId', '==', employerId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    jobId: d.data().jobId as string,
    siteId: d.data().siteId as string,
    workerId: d.data().workerId as string,
    employerId: d.data().employerId as string,
    status: d.data().status as Application['status'],
    message: d.data().message as string | undefined,
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (d.data().updatedAt as Timestamp)?.toDate() ?? new Date(),
  }));
}

/** Update application status (employer action). */
export async function updateApplicationStatus(
  appId: string,
  status: Application['status'],
): Promise<void> {
  await updateDoc(doc(db, 'applications', appId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
