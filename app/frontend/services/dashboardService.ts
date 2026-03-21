import { DashboardData, DashboardPeriod } from '../interfaces/state/dashboardState';

class DashboardService {
  private baseURL = '/api/v1';

  async getDashboard(token: string, period?: DashboardPeriod): Promise<DashboardData> {
    const url = new URL(`${this.baseURL}/dashboard`, window.location.origin);
    if (period) url.searchParams.set('period', period);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch dashboard (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data;
  }
}

export const dashboardService = new DashboardService();
