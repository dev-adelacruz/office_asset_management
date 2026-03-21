export type AssetCategory = 'laptop' | 'monitor' | 'peripheral' | 'furniture' | 'other';
export type AssetCondition = 'brand_new' | 'good' | 'fair' | 'poor';
export type AssetStatus = 'available' | 'assigned' | 'under_maintenance' | 'retired' | 'lost';

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

interface AssetState {
  assets: Asset[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  createError: string | null;
  updateError: string | null;
}
