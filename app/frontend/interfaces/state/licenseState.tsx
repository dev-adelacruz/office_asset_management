export type LicenseStatus = 'active' | 'expiring_soon' | 'expired';

export interface LicenseSeatUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface LicenseSeat {
  id: number;
  user: LicenseSeatUser;
  created_at: string;
}

export interface License {
  id: number;
  software_name: string;
  vendor: string;
  license_key: string;
  total_seats: number;
  seats_used: number;
  seats_available: number;
  license_seats: LicenseSeat[];
  cost: number;
  expiry_date: string;
  status: LicenseStatus;
  renewal_contact: string | null;
  purchase_order_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseState {
  licenses: License[];
  isLoading: boolean;
  isCreating: boolean;
  isEditing: boolean;
  error: string | null;
  createError: string | null;
  editError: string | null;
}
