import { AssetRequest } from '../interfaces/state/assetRequestState';

export interface CreateAssetRequestParams {
  asset_type: string;
  justification: string;
  urgency: string;
  preferred_fulfillment_date?: string;
  notes?: string;
}

class AssetRequestService {
  private baseURL = '/api/v1';

  async listAssetRequests(token: string): Promise<AssetRequest[]> {
    const response = await fetch(`${this.baseURL}/asset_requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch asset requests (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.asset_requests ?? [];
  }

  async updateAssetRequest(
    requestId: number,
    params: { status: string; notes?: string },
    token: string
  ): Promise<AssetRequest> {
    const response = await fetch(`${this.baseURL}/asset_requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asset_request: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update asset request (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.asset_request;
  }

  async createAssetRequest(params: CreateAssetRequestParams, token: string): Promise<AssetRequest> {
    const response = await fetch(`${this.baseURL}/asset_requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asset_request: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to submit asset request (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.asset_request;
  }
}

export const assetRequestService = new AssetRequestService();
