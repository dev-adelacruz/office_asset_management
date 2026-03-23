import { Asset, AssetAssignmentLog, AssetCategory, AssetCondition, AssetPagination, AssetStatus, AssetSummary } from '../interfaces/state/assetState';

export interface FetchAssetsParams {
  page?: number;
  per_page?: number;
  q?: string;
  category?: string;
  status?: string;
  location?: string;
  purchase_date_from?: string;
  purchase_date_to?: string;
}

export interface ListAssetsResult {
  assets: Asset[];
  pagination: AssetPagination;
  summary: AssetSummary;
}

export interface CreateAssignmentLogParams {
  assigned_to_id: number;
  assigned_at: string;
  notes?: string;
}

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

  async listAssets(token: string, params?: FetchAssetsParams): Promise<ListAssetsResult> {
    const url = new URL(`${this.baseURL}/assets`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== '') {
          url.searchParams.set(k, String(v));
        }
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
      throw new Error(errorData.message || `Failed to fetch assets (${response.status})`);
    }

    const data = await response.json();
    return {
      assets: data.status?.data?.assets ?? [],
      pagination: data.status?.data?.pagination ?? { current_page: 1, total_pages: 1, total_count: 0, per_page: 25 },
      summary: data.status?.data?.summary ?? { active: 0, available: 0, assigned: 0, under_maintenance: 0 },
    };
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

  async listAssignmentLogs(assetId: number, token: string): Promise<AssetAssignmentLog[]> {
    const response = await fetch(`${this.baseURL}/assets/${assetId}/assignment_logs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch assignment history (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.assignment_logs ?? [];
  }

  async createAssignmentLog(assetId: number, params: CreateAssignmentLogParams, token: string): Promise<AssetAssignmentLog> {
    const response = await fetch(`${this.baseURL}/assets/${assetId}/assignment_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignment_log: params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to assign asset (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.assignment_log;
  }

  async recordReturn(assetId: number, logId: number, token: string): Promise<AssetAssignmentLog> {
    const response = await fetch(`${this.baseURL}/assets/${assetId}/assignment_logs/${logId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to record return (${response.status})`);
    }

    const data = await response.json();
    return data.status?.data?.assignment_log;
  }
}

export const assetService = new AssetService();
