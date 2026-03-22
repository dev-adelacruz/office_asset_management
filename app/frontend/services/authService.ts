// Authentication service for handling API calls
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
    name: string | null;
    phone_number: string | null;
    office_location: string | null;
    avatar_url: string | null;
  };
  expires_in?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

class AuthService {
  private baseURL = '/api/v1';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/users/sign_in`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: credentials }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const token = response.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
      const data = await response.json();
      const user = data.status?.data?.user;

      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred during login');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      // Only include Authorization header if the token is a well-formed JWT
      // (3 base64url segments separated by dots). A malformed token causes
      // warden-jwt_auth's RevocationManager middleware to crash with
      // JWT::DecodeError before the 200 OK response can be returned.
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (token.split('.').length === 3) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/users/sign_out`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we should clear local auth state
      throw error;
    }
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: AuthResponse['user'] }> {
    try {
      const response = await fetch(`${this.baseURL}/users/validate_token`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
      const user = data.status?.data?.user;
      return { valid: true, user };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }

  // Helper method to set authorization header for future requests
  setAuthHeader(token: string): void {
    // This can be used to configure fetch defaults if needed
    // For now, we'll handle headers in each request
  }
}

export const authService = new AuthService();
