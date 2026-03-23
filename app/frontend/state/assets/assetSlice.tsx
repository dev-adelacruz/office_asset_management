import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assetService, CreateAssetParams, CreateAssignmentLogParams, FetchAssetsParams } from '../../services/assetService';

import { AssetAssignmentLog, AssetPagination, AssetStatus, AssetSummary } from '../../interfaces/state/assetState';
import { RootState } from '../store';

export const fetchAssets = createAsyncThunk(
  'assets/fetchAll',
  async (params: FetchAssetsParams | undefined, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.listAssets(token, params);
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

export const updateAsset = createAsyncThunk(
  'assets/update',
  async ({ assetId, params }: { assetId: number; params: Partial<CreateAssetParams> }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.updateAsset(assetId, params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update asset');
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

export const fetchAssignmentLogs = createAsyncThunk(
  'assets/fetchAssignmentLogs',
  async (assetId: number, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.listAssignmentLogs(assetId, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch assignment history');
    }
  }
);

export const assignAsset = createAsyncThunk(
  'assets/assign',
  async ({ assetId, params }: { assetId: number; params: CreateAssignmentLogParams }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.createAssignmentLog(assetId, params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign asset');
    }
  }
);

export const recordAssetReturn = createAsyncThunk(
  'assets/recordReturn',
  async ({ assetId, logId }: { assetId: number; logId: number }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await assetService.recordReturn(assetId, logId, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to record return');
    }
  }
);

const assetSlice = createSlice({
  name: 'assets',
  initialState: {
    assets: [] as import('../../interfaces/state/assetState').Asset[],
    pagination: null as AssetPagination | null,
    summary: null as AssetSummary | null,
    assignmentLogs: [] as AssetAssignmentLog[],
    isLoading: false,
    isCreating: false,
    isEditing: false,
    isUpdating: false,
    isFetchingHistory: false,
    isAssigning: false,
    isReturning: false,
    error: null as string | null,
    createError: null as string | null,
    editError: null as string | null,
    updateError: null as string | null,
    historyError: null as string | null,
    assignError: null as string | null,
    returnError: null as string | null,
  },
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearEditError: (state) => {
      state.editError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearAssignError: (state) => {
      state.assignError = null;
    },
    clearReturnError: (state) => {
      state.returnError = null;
    },
    clearAssignmentLogs: (state) => {
      state.assignmentLogs = [];
      state.historyError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAssets.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.isLoading = false;
      state.assets = action.payload.assets;
      state.pagination = action.payload.pagination;
      state.summary = action.payload.summary;
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

    builder.addCase(updateAsset.pending, (state) => {
      state.isEditing = true;
      state.editError = null;
    });
    builder.addCase(updateAsset.fulfilled, (state, action) => {
      state.isEditing = false;
      const idx = state.assets.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) state.assets[idx] = action.payload;
    });
    builder.addCase(updateAsset.rejected, (state, action) => {
      state.isEditing = false;
      state.editError = action.payload as string;
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

    builder.addCase(fetchAssignmentLogs.pending, (state) => {
      state.isFetchingHistory = true;
      state.historyError = null;
    });
    builder.addCase(fetchAssignmentLogs.fulfilled, (state, action) => {
      state.isFetchingHistory = false;
      state.assignmentLogs = action.payload;
    });
    builder.addCase(fetchAssignmentLogs.rejected, (state, action) => {
      state.isFetchingHistory = false;
      state.historyError = action.payload as string;
    });

    builder.addCase(assignAsset.pending, (state) => {
      state.isAssigning = true;
      state.assignError = null;
    });
    builder.addCase(assignAsset.fulfilled, (state, action) => {
      state.isAssigning = false;
      state.assignmentLogs.unshift(action.payload);
    });
    builder.addCase(assignAsset.rejected, (state, action) => {
      state.isAssigning = false;
      state.assignError = action.payload as string;
    });

    builder.addCase(recordAssetReturn.pending, (state) => {
      state.isReturning = true;
      state.returnError = null;
    });
    builder.addCase(recordAssetReturn.fulfilled, (state, action) => {
      state.isReturning = false;
      const idx = state.assignmentLogs.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.assignmentLogs[idx] = action.payload;
    });
    builder.addCase(recordAssetReturn.rejected, (state, action) => {
      state.isReturning = false;
      state.returnError = action.payload as string;
    });
  },
});

export const { clearCreateError, clearEditError, clearUpdateError, clearAssignError, clearReturnError, clearAssignmentLogs } = assetSlice.actions;
export default assetSlice.reducer;
