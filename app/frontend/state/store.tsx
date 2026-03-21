import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import assetReducer from './assets/assetSlice';
import licenseReducer from './licenses/licenseSlice';
import assetRequestReducer from './assetRequests/assetRequestSlice';
import notificationReducer from './notifications/notificationSlice';
import auditLogReducer from './auditLogs/auditLogSlice';
import dashboardReducer from './dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    assets: assetReducer,
    licenses: licenseReducer,
    assetRequests: assetRequestReducer,
    notifications: notificationReducer,
    auditLogs: auditLogReducer,
    dashboard: dashboardReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
