import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { licenseService, CreateLicenseParams, FetchLicensesParams } from '../../services/licenseService';
import { License, LicensePagination } from '../../interfaces/state/licenseState';
import { RootState } from '../store';

export const fetchLicenses = createAsyncThunk(
  'licenses/fetchAll',
  async (params: FetchLicensesParams | undefined, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await licenseService.listLicenses(token, params);
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

export const assignSeat = createAsyncThunk(
  'licenses/assignSeat',
  async (
    { licenseId, userEmail }: { licenseId: number; userEmail: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      const result = await licenseService.assignSeat(licenseId, userEmail, token);
      return result.license;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign seat');
    }
  }
);

export const releaseSeat = createAsyncThunk(
  'licenses/releaseSeat',
  async (
    { licenseId, seatId }: { licenseId: number; seatId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).user.token ?? '';
      return await licenseService.releaseSeat(licenseId, seatId, token);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to release seat');
    }
  }
);

const licenseSlice = createSlice({
  name: 'licenses',
  initialState: {
    licenses: [] as License[],
    pagination: null as LicensePagination | null,
    isLoading: false,
    isCreating: false,
    isEditing: false,
    isAssigning: false,
    error: null as string | null,
    createError: null as string | null,
    editError: null as string | null,
    seatError: null as string | null,
  },
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearEditError: (state) => {
      state.editError = null;
    },
    clearSeatError: (state) => {
      state.seatError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLicenses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLicenses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.licenses = action.payload.licenses;
      state.pagination = action.payload.pagination;
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

    builder.addCase(assignSeat.pending, (state) => {
      state.isAssigning = true;
      state.seatError = null;
    });
    builder.addCase(assignSeat.fulfilled, (state, action) => {
      state.isAssigning = false;
      const idx = state.licenses.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.licenses[idx] = action.payload;
    });
    builder.addCase(assignSeat.rejected, (state, action) => {
      state.isAssigning = false;
      state.seatError = action.payload as string;
    });

    builder.addCase(releaseSeat.pending, (state) => {
      state.isAssigning = true;
      state.seatError = null;
    });
    builder.addCase(releaseSeat.fulfilled, (state, action) => {
      state.isAssigning = false;
      const idx = state.licenses.findIndex((l) => l.id === action.payload.id);
      if (idx !== -1) state.licenses[idx] = action.payload;
    });
    builder.addCase(releaseSeat.rejected, (state, action) => {
      state.isAssigning = false;
      state.seatError = action.payload as string;
    });
  },
});

export const { clearCreateError, clearEditError, clearSeatError } = licenseSlice.actions;
export default licenseSlice.reducer;
