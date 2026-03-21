import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import assetReducer from './assets/assetSlice';
import licenseReducer from './licenses/licenseSlice';
import assetRequestReducer from './assetRequests/assetRequestSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    assets: assetReducer,
    licenses: licenseReducer,
    assetRequests: assetRequestReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
