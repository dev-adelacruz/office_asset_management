export interface DashboardActivityItem {
  type: 'audit_log' | 'notification';
  action: string;
  description: string;
  actor_name: string | null;
  created_at: string;
}

export interface DashboardData {
  assets: {
    total: number;
    by_status: {
      available: number;
      assigned: number;
      under_maintenance: number;
      retired: number;
      lost: number;
    };
  };
  licenses: {
    total: number;
    active: number;
    expiring_soon: number;
    expired: number;
  };
  requests: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recent_activity: DashboardActivityItem[];
}

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}
