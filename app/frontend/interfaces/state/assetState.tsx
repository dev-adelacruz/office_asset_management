export type AssetCategory = 'laptop' | 'monitor' | 'peripheral' | 'furniture' | 'other';
export type AssetCondition = 'brand_new' | 'good' | 'fair' | 'poor';
export type AssetStatus = 'available' | 'assigned' | 'under_maintenance' | 'retired' | 'lost';

export interface AssetAssignmentUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AssetAssignmentLog {
  id: number;
  assigned_at: string;
  returned_at: string | null;
  notes: string | null;
  assigned_to: AssetAssignmentUser;
  assigned_by: AssetAssignmentUser;
  created_at: string;
}

export interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category: AssetCategory;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  condition: AssetCondition;
  status: AssetStatus;
  manufacturer: string | null;
  model: string | null;
  warranty_expiry: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface AssetState {
  assets: Asset[];
  pagination: AssetPagination | null;
  assignmentLogs: AssetAssignmentLog[];
  isLoading: boolean;
  isCreating: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  isFetchingHistory: boolean;
  isAssigning: boolean;
  isReturning: boolean;
  error: string | null;
  createError: string | null;
  editError: string | null;
  updateError: string | null;
  historyError: string | null;
  assignError: string | null;
  returnError: string | null;
}
