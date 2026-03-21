import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assetRequestService, CreateAssetRequestParams } from '../../services/assetRequestService';
import { AssetRequest, AssetRequestWithTimeline } from '../../interfaces/state/assetRequestState';
import { RootState } from '../store';

export const fetchAssetRequests = createAsyncThunk(
  'assetRequests/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetRequestService.listAssetRequests(token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch asset requests');
    }
  }
);

export const fetchAssetRequest = createAsyncThunk(
  'assetRequests/fetchOne',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetRequestService.getAssetRequest(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch asset request');
    }
  }
);

export const updateAssetRequest = createAsyncThunk(
  'assetRequests/update',
  async (
    { requestId, params }: { requestId: number; params: { status: string; notes?: string } },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetRequestService.updateAssetRequest(requestId, params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update asset request');
    }
  }
);

export const createAssetRequest = createAsyncThunk(
  'assetRequests/create',
  async (params: CreateAssetRequestParams, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetRequestService.createAssetRequest(params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit asset request');
    }
  }
);

const assetRequestSlice = createSlice({
  name: 'assetRequests',
  initialState: {
    requests: [] as AssetRequest[],
    currentRequest: null as AssetRequestWithTimeline | null,
    isLoading: false,
    isFetchingTimeline: false,
    isCreating: false,
    isUpdating: false,
    error: null as string | null,
    timelineError: null as string | null,
    createError: null as string | null,
    updateError: null as string | null,
  },
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
      state.timelineError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAssetRequests.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAssetRequests.fulfilled, (state, action) => {
      state.isLoading = false;
      state.requests = action.payload;
    });
    builder.addCase(fetchAssetRequests.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createAssetRequest.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createAssetRequest.fulfilled, (state, action) => {
      state.isCreating = false;
      state.requests.unshift(action.payload);
    });
    builder.addCase(createAssetRequest.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload as string;
    });

    builder.addCase(fetchAssetRequest.pending, (state) => {
      state.isFetchingTimeline = true;
      state.timelineError = null;
    });
    builder.addCase(fetchAssetRequest.fulfilled, (state, action) => {
      state.isFetchingTimeline = false;
      state.currentRequest = action.payload;
    });
    builder.addCase(fetchAssetRequest.rejected, (state, action) => {
      state.isFetchingTimeline = false;
      state.timelineError = action.payload as string;
    });

    builder.addCase(updateAssetRequest.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateAssetRequest.fulfilled, (state, action) => {
      state.isUpdating = false;
      const idx = state.requests.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.requests[idx] = action.payload;
    });
    builder.addCase(updateAssetRequest.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload as string;
    });
  },
});

export const { clearCreateError, clearUpdateError, clearCurrentRequest } = assetRequestSlice.actions;
export default assetRequestSlice.reducer;
