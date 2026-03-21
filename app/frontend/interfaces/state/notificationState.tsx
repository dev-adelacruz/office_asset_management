export interface Notification {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  notifiable_type: string;
  notifiable_id: number;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationState {
  notifications: Notification[];
  unread_count: number;
  isLoading: boolean;
  error: string | null;
}
