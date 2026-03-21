import { Asset, AssetCategory, AssetCondition, AssetStatus } from '../interfaces/state/assetState';

export interface CreateAssetParams {
  name: string;
  category: AssetCategory;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  condition: AssetCondition;
  manufacturer?: string;
  model?: string;
  warranty_expiry?: string;
  location?: string;
  notes?: string;
}

class AssetService {
  private baseURL = '/api/v1';

  async listAssets(token: string): Promise<Asset[]> {
    const response = await fetch(`${this.baseURL}/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch assets (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.assets ?? [];
  }

  async createAsset(params: CreateAssetParams, token: string): Promise<Asset> {
    const response = await fetch(`${this.baseURL}/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asset: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create asset (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.asset;
  }

  async updateAsset(assetId: number, params: Partial<CreateAssetParams>, token: string): Promise<Asset> {
    const response = await fetch(`${this.baseURL}/assets/${assetId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asset: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update asset (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.asset;
  }

  async updateAssetStatus(assetId: number, status: AssetStatus, token: string): Promise<Asset> {
    const response = await fetch(`${this.baseURL}/assets/${assetId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update asset status (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.asset;
  }
}

export const assetService = new AssetService();
