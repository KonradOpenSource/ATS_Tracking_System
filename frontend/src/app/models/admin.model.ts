export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'RECRUITER';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  user?: User;
  action: string;
  description: string;
  resourceType: string;
  resourceId?: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCandidates: number;
  totalPipelines: number;
  totalAnalyses: number;
  weeklyActions: number;
  activeTokens: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
