import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assetService, CreateAssetParams } from '../../services/assetService';
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

const assetSlice = createSlice({
  name: 'assets',
  initialState: {
    assets: [] as import('../../interfaces/state/assetState').Asset[],
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
  },
});

export const { clearCreateError } = assetSlice.actions;
export default assetSlice.reducer;
