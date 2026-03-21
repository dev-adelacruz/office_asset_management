import { AuthResponse } from './authService';

export interface ProfileParams {
  name?: string;
  phone_number?: string;
  office_location?: string;
  avatar_url?: string;
}

export interface ProfileResponse {
  user: AuthResponse['user'];
}

class ProfileService {
  private baseURL = '/api/v1';

  async updateProfile(params: ProfileParams, token: string): Promise<ProfileResponse> {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Profile update failed with status ${response.status}`);
    }

    const data = await response.json();
    return { user: data.status?.data?.user };
  }

  async updateUserProfile(userId: number, params: ProfileParams, token: string): Promise<ProfileResponse> {
    const response = await fetch(`${this.baseURL}/users/${userId}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Profile update failed with status ${response.status}`);
    }

    const data = await response.json();
    return { user: data.status?.data?.user };
  }
}

export const profileService = new ProfileService();
