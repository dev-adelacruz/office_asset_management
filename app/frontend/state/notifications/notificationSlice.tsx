import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../interfaces/state/notificationState';
import { RootState } from '../store';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await notificationService.listNotifications(token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await notificationService.markAsRead(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [] as Notification[],
    unread_count: 0,
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload.notifications;
      state.unread_count = action.payload.unread_count;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const idx = state.notifications.findIndex((n) => n.id === action.payload.id);
      if (idx !== -1) {
        state.notifications[idx] = action.payload;
        state.unread_count = Math.max(0, state.unread_count - 1);
      }
    });
  },
});

export default notificationSlice.reducer;
