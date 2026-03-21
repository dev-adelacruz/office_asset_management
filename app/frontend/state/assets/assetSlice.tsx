import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assetService, CreateAssetParams } from '../../services/assetService';
import { AssetStatus } from '../../interfaces/state/assetState';
import { RootState } from '../store';

export const fetchAssets = createAsyncThunk(
  'assets/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.listAssets(token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch assets');
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/create',
  async (params: CreateAssetParams, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.createAsset(params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create asset');
    }
  }
);

export const updateAssetStatus = createAsyncThunk(
  'assets/updateStatus',
  async ({ assetId, status }: { assetId: number; status: AssetStatus }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.updateAssetStatus(assetId, status, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update asset status');
    }
  }
);

const assetSlice = createSlice({
  name: 'assets',
  initialState: {
    assets: [] as import('../../interfaces/state/assetState').Asset[],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    error: null as string | null,
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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAssets.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.isLoading = false;
      state.assets = action.payload;
    });
    builder.addCase(fetchAssets.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createAsset.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createAsset.fulfilled, (state, action) => {
      state.isCreating = false;
      state.assets.unshift(action.payload);
    });
    builder.addCase(createAsset.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload as string;
    });

    builder.addCase(updateAssetStatus.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateAssetStatus.fulfilled, (state, action) => {
      state.isUpdating = false;
      const idx = state.assets.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) state.assets[idx] = action.payload;
    });
    builder.addCase(updateAssetStatus.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload as string;
    });
  },
});

export const { clearCreateError, clearUpdateError } = assetSlice.actions;
export default assetSlice.reducer;
