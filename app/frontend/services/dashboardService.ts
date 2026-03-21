import { DashboardData } from '../interfaces/state/dashboardState';

class DashboardService {
  private baseURL = '/api/v1';

  async getDashboard(token: string): Promise<DashboardData> {
    const response = await fetch(`${this.baseURL}/dashboard`, {
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
