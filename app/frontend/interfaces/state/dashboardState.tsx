export interface DashboardActivityItem {
  type: 'audit_log' | 'notification';
  action: string;
  description: string;
  actor_name: string | null;
  created_at: string;
}

export type DashboardPeriod = 'this_month' | 'last_month' | 'last_quarter' | 'this_year';

export interface DashboardData {
  assets: {
    total: number;
    total_value: number;
    period_additions: number;
    period_spend: number;
    by_status: {
      available: number;
      assigned: number;
      under_maintenance: number;
      retired: number;
      lost: number;
    };
    by_category: {
      laptop: number;
      monitor: number;
      peripheral: number;
      furniture: number;
      other: number;
    };
  };
  licenses: {
    total: number;
    active: number;
    expiring_soon: number;
    expired: number;
    utilization: {
      total_seats: number;
      used_seats: number;
    };
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
