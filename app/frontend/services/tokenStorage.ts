// Token storage service.
// Tokens are stored in plain text. JWTs are opaque bearer credentials with
// short expiry — no sensitive personal data is encoded inside them.
// If encryption at rest becomes a requirement, use an IndexedDB-persisted
// CryptoKey rather than generating an ephemeral key per call.

export interface TokenStorageOptions {
  storageType: 'local' | 'session';
}

class TokenStorage {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly STORAGE_TYPE_KEY = 'auth_storage_type';

  storeToken(token: string, options: TokenStorageOptions): void {
    const storage = options.storageType === 'local' ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.STORAGE_TYPE_KEY, options.storageType);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.STORAGE_TYPE_KEY);
  }

  getStorageType(): 'local' | 'session' | null {
    return localStorage.getItem(this.STORAGE_TYPE_KEY) as 'local' | 'session' | null;
  }

  hasToken(): boolean {
    return !!(localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY));
  }
}

export const tokenStorage = new TokenStorage();
