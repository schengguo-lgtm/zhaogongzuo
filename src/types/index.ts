// ─────────────────────────────────────────────
//  Domain Types — 찾공做 / ZhaoGongZuo MVP
// ─────────────────────────────────────────────

export type Language = 'ko' | 'zh' | 'en';

export type UserRole = 'worker' | 'employer' | 'both';

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  profilePhoto?: string;
  language: Language;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  ownerId: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNote?: string;
  logoUrl?: string;
  createdAt: Date;
}

export type JobType =
  | 'concrete'
  | 'steel'
  | 'carpentry'
  | 'painting'
  | 'electrical'
  | 'plumbing'
  | 'scaffolding'
  | 'demolition'
  | 'general_labor'
  | 'crane_operator'
  | 'surveyor'
  | 'safety_officer';

export interface Job {
  id: string;
  siteId: string;
  title: string;
  jobType: JobType;
  dailyWage: number;         // KRW
  currency: 'KRW';
  headcount: number;         // number of workers needed
  filledCount: number;       // already filled
  workDates: string[];       // ISO date strings
  startTime: string;         // 'HH:mm'
  endTime: string;           // 'HH:mm'
  description: string;
  requirements: string[];
  employerId: string;
  companyId?: string;
  createdAt: Date;
}

export interface ConstructionSite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;       // calculated at runtime
  jobs: Job[];
  contactPhone: string;
  description: string;
  imageUrl?: string;
  employerId: string;
  isActive: boolean;
  createdAt: Date;
}

export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'completed';

export interface Application {
  id: string;
  jobId: string;
  siteId: string;
  workerId: string;
  employerId: string;
  status: ApplicationStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Document & Authorization ────────────────

export type DocumentType =
  | 'id_card'
  | 'residence_card'
  | 'work_permit'
  | 'safety_certificate'
  | 'skill_certificate';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface WorkerDocument {
  id: string;
  workerId: string;
  type: DocumentType;
  fileUrl: string;           // Firebase Storage URL (encrypted in production)
  status: DocumentStatus;
  uploadedAt: Date;
  expiresAt?: Date;          // document expiry (e.g. work permit)
}

export interface DocumentAuthorization {
  id: string;
  documentId: string;
  workerId: string;
  requestedBy: string;       // employerId
  authorizedAt?: Date;
  expiresAt?: Date;          // +24h from authorizedAt
  isActive: boolean;
  auditLog: AuditLogEntry[];
}

export interface AuditLogEntry {
  timestamp: Date;
  action: 'requested' | 'authorized' | 'viewed' | 'revoked' | 'expired';
  actorId: string;
  ipAddress?: string;        // populated server-side in production
}

// ─── Chat ────────────────────────────────────

export interface ChatRoom {
  id: string;
  participants: string[];    // [workerId, employerId]
  jobId?: string;
  siteId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  sentAt: Date;
  readAt?: Date;
}

// ─── Rate Limiting ───────────────────────────

export interface RateLimitRecord {
  key: string;               // e.g. 'apply_YYYY-MM-DD'
  count: number;
  resetAt: Date;
}

// ─── Navigation Params ───────────────────────

export type RootStackParamList = {
  '(auth)/language': undefined;
  '(auth)/login': undefined;
  '(auth)/otp': { phone: string };
  '(tabs)': undefined;
  'site/[id]': { id: string };
  'chat/[id]': { id: string };
  'employer/dashboard': undefined;
  'document-auth': { documentId: string; requesterId: string };
  'disclaimer': undefined;
};
