import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditLogService, AuditLogFilters } from '../../services/auditLogService';
import { AuditLog } from '../../interfaces/state/auditLogState';
import { RootState } from '../store';

export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAll',
  async (filters: AuditLogFilters = {}, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await auditLogService.listAuditLogs(token, filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch audit logs');
    }
  }
);

const auditLogSlice = createSlice({
  name: 'auditLogs',
  initialState: {
    audit_logs: [] as AuditLog[],
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAuditLogs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAuditLogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.audit_logs = action.payload;
    });
    builder.addCase(fetchAuditLogs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export default auditLogSlice.reducer;
