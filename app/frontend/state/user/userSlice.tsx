import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from '../../services/authService';
import { profileService, ProfileParams } from '../../services/profileService';
import { tokenStorage } from '../../services/tokenStorage';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      tokenStorage.storeToken(response.token, { storageType: 'local' });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as { user: UserState }).user.token;
      if (!token) {
        tokenStorage.clearToken();
        return null;
      }
      await authService.logout(token);
      // Clear token from storage on logout
      tokenStorage.clearToken();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      
      if (token) {
        const { valid, user } = await authService.validateToken(token);

        if (valid) {
          return { token, user: user ?? null };
        }
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (params: ProfileParams, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      if (!token) throw new Error('Not authenticated');
      const { user } = await profileService.updateProfile(params, token);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

const initialState: UserState = {
  isSignedIn: false,
  token: null,
  user: null,
  isLoading: false,
  isUpdatingProfile: false,
  error: null,
  profileError: null,
};

const userSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    signIn: (state) => {
      state.isSignedIn = true
    },
    signOut: (state) => {
      state.isSignedIn = false
      state.token = null
      state.user = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSignedIn = true
      state.token = action.payload.token
      state.user = action.payload.user
      state.error = null
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Logout cases
    builder.addCase(logoutUser.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isLoading = false
      state.isSignedIn = false
      state.token = null
      state.user = null
      state.error = null
    })
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Check auth status cases
    builder.addCase(checkAuthStatus.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.isLoading = false
      if (action.payload) {
        state.isSignedIn = true
        state.token = action.payload.token
        state.user = action.payload.user
      } else {
        state.isSignedIn = false
        state.token = null
        state.user = null
      }
      state.error = null
    })
    builder.addCase(checkAuthStatus.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Update profile cases
    builder.addCase(updateProfile.pending, (state) => {
      state.isUpdatingProfile = true
      state.profileError = null
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isUpdatingProfile = false
      state.user = action.payload
      state.profileError = null
    })
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isUpdatingProfile = false
      state.profileError = action.payload as string
    })
  }
})

export const { signIn, signOut, clearError } = userSlice.actions;
export default userSlice.reducer;
