export type AssetRequestType = 'physical' | 'software';
export type AssetRequestUrgency = 'low' | 'medium' | 'high';
export type AssetRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AssetRequestUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AssetRequest {
  id: number;
  asset_type: AssetRequestType;
  justification: string;
  urgency: AssetRequestUrgency;
  preferred_fulfillment_date: string | null;
  status: AssetRequestStatus;
  notes: string | null;
  user: AssetRequestUser;
  created_at: string;
  updated_at: string;
}

export interface AssetRequestState {
  requests: AssetRequest[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  createError: string | null;
}
