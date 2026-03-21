import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../services/dashboardService';
import { DashboardData, DashboardPeriod } from '../../interfaces/state/dashboardState';
import { RootState } from '../store';

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (period: DashboardPeriod | undefined, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await dashboardService.getDashboard(token, period);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: null as DashboardData | null,
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDashboard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchDashboard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export default dashboardSlice.reducer;
