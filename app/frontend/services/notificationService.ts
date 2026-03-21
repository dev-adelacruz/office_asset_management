import { Notification } from '../interfaces/state/notificationState';

class NotificationService {
  private baseURL = '/api/v1';

  async listNotifications(token: string): Promise<{ notifications: Notification[]; unread_count: number }> {
    const response = await fetch(`${this.baseURL}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch notifications (${response.status})`);
    }

    const data = await response.json();
    return {
      notifications: data.status?.data?.notifications ?? [],
      unread_count: data.status?.data?.unread_count ?? 0,
    };
  }

  async markAsRead(id: number, token: string): Promise<Notification> {
    const response = await fetch(`${this.baseURL}/notifications/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to mark notification as read (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.notification;
  }
}

export const notificationService = new NotificationService();
