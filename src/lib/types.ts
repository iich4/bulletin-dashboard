// Shared client-side types for the PERKESO Bulletin Dashboard

export interface Attachment {
  name: string;
  type: "PDF" | "DOCX" | "XLSX" | "PPTX" | "IMG" | string;
  size: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  authorName: string;
  authorId: string | null;
  isPinned: boolean;
  isNew: boolean;
  isUrgent: boolean;
  attachments: Attachment[];
  coverColor: string;
  datePublished: string;
  createdAt: string;
  updatedAt: string;
}

export interface Act {
  id: string;
  actNumber: string;
  title: string;
  category: string;
  description: string;
  fileName: string | null;
  fileSize: string | null;
  version: string;
  status: "Aktif" | "Digantungan" | "Digantikan" | "Dalam Semakan";
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asip {
  id: string;
  title: string;
  referenceNo: string;
  description: string;
  effectiveDate: string;
  fileName: string | null;
  fileSize: string | null;
  status: "Aktif" | "Digantikan" | "Dalam Semakan";
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sop {
  id: string;
  title: string;
  department: string;
  description: string;
  procedureSteps: string[];
  fileName: string | null;
  fileSize: string | null;
  version: string;
  approvedBy: string;
  dateApproved: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Circular {
  id: string;
  circularNo: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  fileName: string | null;
  fileSize: string | null;
  isMandatory: boolean;
  dateIssued: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = "info" | "warning" | "success" | "critical";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  module: string;
  refId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "Staff";
  department: string | null;
  branch: string | null;
  position: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface DashboardStats {
  counts: {
    announcements: number;
    acts: number;
    asips: number;
    sops: number;
    circulars: number;
    faqs: number;
    mandatoryCirculars: number;
  };
  recentAnnouncements: Announcement[];
  recentCirculars: Circular[];
  charts: {
    announcementsByCategory: { label: string; value: number }[];
    circularsByCategory: { label: string; value: number }[];
    sopsByDepartment: { label: string; value: number }[];
    actsByCategory: { label: string; value: number }[];
    monthlyAnnouncements: { label: string; count: number }[];
  };
}

export interface SearchResults {
  groups: {
    announcements: SearchResultItem[];
    acts: SearchResultItem[];
    asip: SearchResultItem[];
    sop: SearchResultItem[];
    circulars: SearchResultItem[];
    faq: SearchResultItem[];
  };
  total: number;
  query: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  date: string;
}
