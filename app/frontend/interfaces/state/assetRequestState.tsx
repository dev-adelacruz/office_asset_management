export type AssetRequestType = 'physical' | 'software';
export type AssetRequestUrgency = 'low' | 'medium' | 'high';
export type AssetRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AssetRequestUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AssetRequestStatusLog {
  id: number;
  from_status: string | null;
  to_status: string;
  created_at: string;
  changed_by: AssetRequestUser;
}

export interface AssetRequestItemAsset {
  id: number;
  name: string;
  status: string;
  category: string;
}

export interface AssetRequestItemLicense {
  id: number;
  software_name: string;
  vendor: string;
}

export interface AssetRequest {
  id: number;
  asset_type: AssetRequestType;
  justification: string;
  urgency: AssetRequestUrgency;
  preferred_fulfillment_date: string | null;
  status: AssetRequestStatus;
  notes: string | null;
  asset_id: number | null;
  license_id: number | null;
  asset: AssetRequestItemAsset | null;
  license: AssetRequestItemLicense | null;
  user: AssetRequestUser;
  created_at: string;
  updated_at: string;
}

export interface AssetRequestWithTimeline extends AssetRequest {
  status_logs: AssetRequestStatusLog[];
}

export interface AssetRequestPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface AssetRequestState {
  requests: AssetRequest[];
  pagination: AssetRequestPagination | null;
  currentRequest: AssetRequestWithTimeline | null;
  isLoading: boolean;
  isFetchingTimeline: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  timelineError: string | null;
  createError: string | null;
  updateError: string | null;
}
