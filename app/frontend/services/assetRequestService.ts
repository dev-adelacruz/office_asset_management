import { AssetRequest, AssetRequestPagination, AssetRequestWithTimeline } from '../interfaces/state/assetRequestState';

export interface FetchAssetRequestsParams {
  page?: number;
  per_page?: number;
}

export interface ListAssetRequestsResult {
  requests: AssetRequest[];
  pagination: AssetRequestPagination;
}

export interface CreateAssetRequestParams {
  asset_type: string;
  justification: string;
  urgency: string;
  preferred_fulfillment_date?: string;
  notes?: string;
}

class AssetRequestService {
  private baseURL = '/api/v1';

  async listAssetRequests(token: string, params?: FetchAssetRequestsParams): Promise<ListAssetRequestsResult> {
    const url = new URL(`${this.baseURL}/asset_requests`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }

    const response = await fetch(url.pathname + url.search, {
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
    return {
      requests: data.status?.data?.asset_requests ?? [],
      pagination: data.status?.data?.pagination ?? { current_page: 1, total_pages: 1, total_count: 0, per_page: 25 },
    };
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

  async getAssetRequest(id: number, token: string): Promise<AssetRequestWithTimeline> {
    const response = await fetch(`${this.baseURL}/asset_requests/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch asset request (${response.status})`);
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
