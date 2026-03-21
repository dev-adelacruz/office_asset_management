import { License, LicenseSeat } from '../interfaces/state/licenseState';

export interface CreateLicenseParams {
  software_name: string;
  vendor: string;
  license_key: string;
  total_seats: number;
  cost: number;
  expiry_date: string;
  renewal_contact?: string;
  purchase_order_number?: string;
  notes?: string;
}

class LicenseService {
  private baseURL = '/api/v1';

  async listLicenses(token: string): Promise<License[]> {
    const response = await fetch(`${this.baseURL}/licenses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch licenses (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.licenses ?? [];
  }

  async createLicense(params: CreateLicenseParams, token: string): Promise<License> {
    const response = await fetch(`${this.baseURL}/licenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create license (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.license;
  }

  async updateLicense(licenseId: number, params: Partial<CreateLicenseParams>, token: string): Promise<License> {
    const response = await fetch(`${this.baseURL}/licenses/${licenseId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update license (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.license;
  }

  async assignSeat(licenseId: number, userEmail: string, token: string): Promise<{ seat: LicenseSeat; license: License }> {
    const response = await fetch(`${this.baseURL}/licenses/${licenseId}/seats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: userEmail }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to assign seat (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data;
  }

  async releaseSeat(licenseId: number, seatId: number, token: string): Promise<License> {
    const response = await fetch(`${this.baseURL}/licenses/${licenseId}/seats/${seatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to release seat (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.license;
  }
}

export const licenseService = new LicenseService();
