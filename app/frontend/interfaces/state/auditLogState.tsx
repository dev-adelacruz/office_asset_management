export interface AuditLogActor {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
}

export interface AuditLog {
  id: number;
  action: string;
  auditable_type: string;
  auditable_id: number;
  changes_before: Record<string, unknown>;
  changes_after: Record<string, unknown>;
  actor: AuditLogActor | null;
  created_at: string;
}

export interface AuditLogPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface AuditLogState {
  audit_logs: AuditLog[];
  pagination: AuditLogPagination | null;
  isLoading: boolean;
  error: string | null;
}
