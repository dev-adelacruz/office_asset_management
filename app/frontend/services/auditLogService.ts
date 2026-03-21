import { AuditLog, AuditLogPagination } from '../interfaces/state/auditLogState';

export interface AuditLogFilters {
  actor_id?: number | string;
  action_type?: string;
  auditable_type?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export interface AuditLogListResult {
  audit_logs: AuditLog[];
  pagination: AuditLogPagination;
}

class AuditLogService {
  private baseURL = '/api/v1';

  async listAuditLogs(token: string, filters: AuditLogFilters = {}): Promise<AuditLogListResult> {
    const params = new URLSearchParams();
    if (filters.actor_id) params.set('actor_id', String(filters.actor_id));
    if (filters.action_type) params.set('action_type', filters.action_type);
    if (filters.auditable_type) params.set('auditable_type', filters.auditable_type);
    if (filters.from_date) params.set('from_date', filters.from_date);
    if (filters.to_date) params.set('to_date', filters.to_date);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.per_page) params.set('per_page', String(filters.per_page));

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${this.baseURL}/audit_logs${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch audit logs (${response.status})`);
    }

    const data = await response.json();
    return {
      audit_logs: data.status?.data?.audit_logs ?? [],
      pagination: data.status?.data?.pagination,
    };
  }
}

export const auditLogService = new AuditLogService();
