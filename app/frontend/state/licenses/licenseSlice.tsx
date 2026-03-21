import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { licenseService, CreateLicenseParams } from '../../services/licenseService';
import { License } from '../../interfaces/state/licenseState';
import { RootState } from '../store';

export const fetchLicenses = createAsyncThunk(
  'licenses/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await licenseService.listLicenses(token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch licenses');
    }
  }
);

export const createLicense = createAsyncThunk(
  'licenses/create',
  async (params: CreateLicenseParams, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await licenseService.createLicense(params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create license');
    }
  }
);

export const updateLicense = createAsyncThunk(
  'licenses/update',
  async (
    { licenseId, params }: { licenseId: number; params: Partial<CreateLicenseParams> },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await licenseService.updateLicense(licenseId, params, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update license');
    }
  }
);

const licenseSlice = createSlice({
  name: 'licenses',
  initialState: {
    licenses: [] as License[],
    isLoading: false,
    isCreating: false,
    isEditing: false,
    error: null as string | null,
    createError: null as string | null,
    editError: null as string | null,
  },
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearEditError: (state) => {
      state.editError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLicenses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLicenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.licenses = action.payload;
    });
    builder.addCase(fetchLicenses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createLicense.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createLicense.fulfilled, (state, action) => {
      state.isCreating = false;
      state.licenses.unshift(action.payload);
    });
    builder.addCase(createLicense.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload as string;
    });

    builder.addCase(updateLicense.pending, (state) => {
      state.isEditing = true;
      state.editError = null;
    });
    builder.addCase(updateLicense.fulfilled, (state, action) => {
      state.isEditing = false;
      const idx = state.licenses.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.licenses[idx] = action.payload;
    });
    builder.addCase(updateLicense.rejected, (state, action) => {
      state.isEditing = false;
      state.editError = action.payload as string;
    });
  },
});

export const { clearCreateError, clearEditError } = licenseSlice.actions;
export default licenseSlice.reducer;
