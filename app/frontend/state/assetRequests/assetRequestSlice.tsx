import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assetRequestService, CreateAssetRequestParams } from '../../services/assetRequestService';
import { AssetRequest } from '../../interfaces/state/assetRequestState';
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
    isLoading: false,
    isCreating: false,
    error: null as string | null,
    createError: null as string | null,
  },
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
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
  },
});

export const { clearCreateError } = assetRequestSlice.actions;
export default assetRequestSlice.reducer;
