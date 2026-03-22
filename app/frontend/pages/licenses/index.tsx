import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/hooks';
import {
  fetchLicenses,
  createLicense,
  updateLicense,
  assignSeat,
  releaseSeat,
  clearCreateError,
  clearEditError,
  clearSeatError,
} from '../../state/licenses/licenseSlice';
import { RootState } from '../../state/store';
import { License, LicenseSeat, LicenseStatus } from '../../interfaces/state/licenseState';
import { CreateLicenseParams } from '../../services/licenseService';
import AppLayout from '../../components/layout/AppLayout';
import Pagination from '../../components/Pagination';
import {
  Plus,
  Pencil,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Users,
  UserMinus,
  UserPlus,
  ClipboardList,
  Search,
} from 'lucide-react';
import ItemRequestModal, { ItemContext } from '../../components/ItemRequestModal';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LicenseStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  expiring_soon: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  expired: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const STATUS_LABELS: Record<LicenseStatus, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

const STATUS_ICONS: Record<LicenseStatus, React.ReactNode> = {
  active: <ShieldCheck className="w-3 h-3" />,
  expiring_soon: <AlertTriangle className="w-3 h-3" />,
  expired: <XCircle className="w-3 h-3" />,
};

// ─── RegisterLicenseModal ─────────────────────────────────────────────────────

interface RegisterLicenseModalProps {
  onClose: () => void;
}

const RegisterLicenseModal: React.FC<RegisterLicenseModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { isCreating, createError } = useSelector((s: RootState) => s.licenses);
  const [visible, setVisible] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState({
    software_name: '',
    vendor: '',
    license_key: '',
    total_seats: '',
    cost: '',
    expiry_date: '',
    renewal_contact: '',
    purchase_order_number: '',
    notes: '',
  });

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
    dispatch(clearCreateError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params: CreateLicenseParams = {
      software_name: form.software_name,
      vendor: form.vendor,
      license_key: form.license_key,
      total_seats: Number(form.total_seats),
      cost: Number(form.cost),
      expiry_date: form.expiry_date,
      ...(form.renewal_contact && { renewal_contact: form.renewal_contact }),
      ...(form.purchase_order_number && { purchase_order_number: form.purchase_order_number }),
      ...(form.notes && { notes: form.notes }),
    };
    const result = await dispatch(createLicense(params));
    if (!result.error) handleClose();
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/40' : 'bg-transparent'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Register License</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {createError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{createError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Software Name <span className="text-red-500">*</span></label>
              <input {...field('software_name')} required placeholder="Adobe Creative Cloud" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
              <input {...field('vendor')} required placeholder="Adobe Inc." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
              <input {...field('purchase_order_number')} placeholder="PO-2026-001" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">License Key <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  {...field('license_key')}
                  required
                  type={showKey ? 'text' : 'password'}
                  placeholder="XXXX-YYYY-ZZZZ-1234"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total Seats <span className="text-red-500">*</span></label>
              <input {...field('total_seats')} required type="number" min="1" placeholder="10" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost (USD) <span className="text-red-500">*</span></label>
              <input {...field('cost')} required type="number" min="0" step="0.01" placeholder="599.99" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date <span className="text-red-500">*</span></label>
              <input {...field('expiry_date')} required type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Renewal Contact</label>
              <input {...field('renewal_contact')} type="email" placeholder="it@company.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea {...field('notes')} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none" />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Registering...' : 'Register License'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EditLicenseModal ─────────────────────────────────────────────────────────

interface EditLicenseModalProps {
  license: License;
  onClose: () => void;
}

const EditLicenseModal: React.FC<EditLicenseModalProps> = ({ license, onClose }) => {
  const dispatch = useAppDispatch();
  const { isEditing, editError } = useSelector((s: RootState) => s.licenses);
  const [visible, setVisible] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState({
    software_name: license.software_name,
    vendor: license.vendor,
    license_key: license.license_key,
    total_seats: String(license.total_seats),
    cost: String(license.cost),
    expiry_date: license.expiry_date,
    renewal_contact: license.renewal_contact ?? '',
    purchase_order_number: license.purchase_order_number ?? '',
    notes: license.notes ?? '',
  });

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
    dispatch(clearEditError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params: Partial<CreateLicenseParams> = {
      software_name: form.software_name,
      vendor: form.vendor,
      license_key: form.license_key,
      total_seats: Number(form.total_seats),
      cost: Number(form.cost),
      expiry_date: form.expiry_date,
      renewal_contact: form.renewal_contact || undefined,
      purchase_order_number: form.purchase_order_number || undefined,
      notes: form.notes || undefined,
    };
    const result = await dispatch(updateLicense({ licenseId: license.id, params }));
    if (!result.error) handleClose();
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/40' : 'bg-transparent'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit License</h2>
            <p className="text-xs text-gray-400 mt-0.5">{license.software_name}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {editError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{editError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Software Name <span className="text-red-500">*</span></label>
              <input {...field('software_name')} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
              <input {...field('vendor')} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
              <input {...field('purchase_order_number')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">License Key <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  {...field('license_key')}
                  required
                  type={showKey ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total Seats <span className="text-red-500">*</span></label>
              <input {...field('total_seats')} required type="number" min="1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost (USD) <span className="text-red-500">*</span></label>
              <input {...field('cost')} required type="number" min="0" step="0.01" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date <span className="text-red-500">*</span></label>
              <input {...field('expiry_date')} required type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Renewal Contact</label>
              <input {...field('renewal_contact')} type="email" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea {...field('notes')} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none" />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={isEditing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ManageSeatsModal ─────────────────────────────────────────────────────────

interface ManageSeatsModalProps {
  license: License;
  onClose: () => void;
}

const ManageSeatsModal: React.FC<ManageSeatsModalProps> = ({ license: initialLicense, onClose }) => {
  const dispatch = useAppDispatch();
  const { isAssigning, seatError } = useSelector((s: RootState) => s.licenses);
  const licenses = useSelector((s: RootState) => s.licenses.licenses);
  const license = licenses.find((l) => l.id === initialLicense.id) ?? initialLicense;

  const [visible, setVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
    dispatch(clearSeatError());
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const result = await dispatch(assignSeat({ licenseId: license.id, userEmail: emailInput.trim() }));
    if (!result.error) setEmailInput('');
  };

  const handleRelease = async (seat: LicenseSeat) => {
    dispatch(releaseSeat({ licenseId: license.id, seatId: seat.id }));
  };

  const utilizationPct = license.total_seats > 0
    ? Math.round((license.seats_used / license.total_seats) * 100)
    : 0;

  const barColor = utilizationPct >= 100
    ? 'bg-red-500'
    : utilizationPct >= 75
    ? 'bg-amber-400'
    : 'bg-emerald-500';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/40' : 'bg-transparent'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Manage Seats</h2>
            <p className="text-xs text-gray-400 mt-0.5">{license.software_name}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Utilization bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Seat utilization</span>
              <span className="text-xs font-semibold text-gray-700">
                {license.seats_used} / {license.total_seats} used ({utilizationPct}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(utilizationPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Error */}
          {seatError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{seatError}</p>
            </div>
          )}

          {/* Assign form */}
          <form onSubmit={handleAssign} className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="user@company.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isAssigning || !emailInput.trim() || license.seats_available <= 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Assign
            </button>
          </form>

          {/* Current assignments */}
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {license.license_seats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No seats assigned yet.</p>
            ) : (
              license.license_seats.map((seat) => (
                <div key={seat.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {seat.user.name || seat.user.email}
                    </p>
                    {seat.user.name && (
                      <p className="text-xs text-gray-400 truncate">{seat.user.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRelease(seat)}
                    disabled={isAssigning}
                    className="ml-3 p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 transition-colors shrink-0"
                    title="Release seat"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SuccessToast ─────────────────────────────────────────────────────────────

interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
      </div>
      <p className="text-sm font-medium text-gray-800">{message}</p>
      <button onClick={onDismiss} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─── License Detail Drawer ────────────────────────────────────────────────────

const LicenseDetailDrawer: React.FC<{
  license: License;
  onClose: () => void;
  onRequestClick: (license: License) => void;
}> = ({ license, onClose, onRequestClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const seatsAvailable = license.seats_available ?? (license.total_seats - (license.seats_used ?? 0));
  const canRequest = seatsAvailable > 0 && license.status !== 'expired';
  const expiryDays = Math.ceil((new Date(license.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const utilizationPct = license.total_seats > 0
    ? Math.round(((license.seats_used ?? 0) / license.total_seats) * 100)
    : 0;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white w-full max-w-sm shadow-2xl flex flex-col transition-transform duration-250 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{license.software_name}</p>
              <p className="text-xs text-gray-400">{license.vendor}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[license.status]}`}>
              {STATUS_ICONS[license.status]}
              {STATUS_LABELS[license.status]}
            </span>
            {license.status === 'expiring_soon' && (
              <span className="text-xs text-amber-600">{expiryDays}d left</span>
            )}
          </div>

          {/* Seats */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-gray-500">Seat Utilization</p>
              <p className="text-xs font-semibold text-gray-700">
                {license.seats_used ?? 0} / {license.total_seats} used
                <span className="ml-1 text-gray-400">({seatsAvailable} available)</span>
              </p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilizationPct >= 100 ? 'bg-red-500' : utilizationPct >= 75 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(utilizationPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Cost</dt>
              <dd className="text-gray-800">{formatCurrency(license.cost)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Expiry Date</dt>
              <dd className="text-gray-800">{formatDate(license.expiry_date)}</dd>
            </div>
            {license.renewal_contact && (
              <div className="col-span-2">
                <dt className="text-xs font-medium text-gray-400 mb-0.5">Renewal Contact</dt>
                <dd className="text-gray-800">{license.renewal_contact}</dd>
              </div>
            )}
            {license.notes && (
              <div className="col-span-2">
                <dt className="text-xs font-medium text-gray-400 mb-0.5">Notes</dt>
                <dd className="text-gray-600 text-xs leading-relaxed">{license.notes}</dd>
              </div>
            )}
          </dl>

          {/* Currently assigned */}
          {license.license_seats.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Currently Assigned ({license.license_seats.length})</p>
              <ul className="space-y-1.5 max-h-36 overflow-y-auto">
                {license.license_seats.map((seat) => (
                  <li key={seat.id} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Users className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-gray-700 truncate">{seat.user.name ?? seat.user.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer — Request CTA */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          {canRequest ? (
            <button
              onClick={() => { handleClose(); onRequestClick(license); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              Request This Item
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1 py-1">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                <ClipboardList className="w-4 h-4" />
                Request This Item
              </button>
              <p className="text-xs text-gray-400 mt-1">
                {license.status === 'expired' ? 'This license has expired.' : 'No seats available.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── LicensesPage ─────────────────────────────────────────────────────────────

const LicensesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { licenses, pagination, isLoading, error } = useSelector((s: RootState) => s.licenses);
  const user = useSelector((s: RootState) => s.user.user);

  const [showRegister, setShowRegister] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [managingLicense, setManagingLicense] = useState<License | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerLicense, setDrawerLicense] = useState<License | null>(null);
  const [requestItemContext, setRequestItemContext] = useState<ItemContext | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const prevLicensesRef = useRef<License[]>([]);

  const canWrite = user?.role === 'manager' || user?.role === 'executive';

  useEffect(() => {
    dispatch(fetchLicenses({ page: currentPage, per_page: 25, q: searchQuery || undefined, status: filterStatus || undefined }));
  }, [dispatch, currentPage, searchQuery, filterStatus]);

  useEffect(() => {
    if (prevLicensesRef.current.length > 0) {
      const prev = prevLicensesRef.current;
      const added = licenses.find((l) => !prev.some((p) => p.id === l.id));
      if (added) setToast(`"${added.software_name}" registered successfully.`);

      const updated = licenses.find((l) => {
        const p = prev.find((p) => p.id === l.id);
        return p && p.updated_at !== l.updated_at;
      });
      if (updated) setToast(`"${updated.software_name}" updated successfully.`);
    }
    prevLicensesRef.current = licenses;
  }, [licenses]);

  const stats = {
    total: pagination?.total_count ?? licenses.length,
    active: licenses.filter((l) => l.status === 'active').length,
    expiring: licenses.filter((l) => l.status === 'expiring_soon').length,
    expired: licenses.filter((l) => l.status === 'expired').length,
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const daysUntilExpiry = (d: string) => {
    const diff = new Date(d).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <AppLayout title="Software Licenses">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {stats.total} license{stats.total !== 1 ? 's' : ''} registered
            </p>
          </div>
          {canWrite && (
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              Register License
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Active', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Expiring Soon', value: stats.expiring, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Expired', value: stats.expired, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100 shadow-sm`}>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search software, vendor, PO…"
                className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 placeholder:text-gray-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="pl-3 pr-8 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none transition-all duration-150 cursor-pointer"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
            {(searchQuery || filterStatus) && (
              <button
                onClick={() => { setSearchQuery(''); setFilterStatus(''); setCurrentPage(1); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-150 whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading licenses...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
          ) : licenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ShieldCheck className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">
                {!searchQuery && !filterStatus ? 'No licenses registered yet' : 'No licenses match your filters'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Software</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Seats Used</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                  {canWrite && (
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {licenses.map((license) => {
                  const days = daysUntilExpiry(license.expiry_date);
                  return (
                    <tr key={license.id} className="hover:bg-blue-50/40 transition-colors duration-100">
                      <td
                        className="px-5 py-3.5 cursor-pointer"
                        onClick={() => setDrawerLicense(license)}
                        title="View license details"
                      >
                        <div className="font-medium text-gray-900 hover:text-blue-700 transition-colors">{license.software_name}</div>
                        {license.purchase_order_number && (
                          <div className="text-xs text-gray-400 mt-0.5">{license.purchase_order_number}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{license.vendor}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium text-gray-700">
                          {(license.seats_used ?? 0)}/{license.total_seats}
                        </div>
                        <div className="mt-1 h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              (license.seats_used ?? 0) >= license.total_seats
                                ? 'bg-red-500'
                                : (license.seats_used ?? 0) / license.total_seats >= 0.75
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                Math.round(((license.seats_used ?? 0) / license.total_seats) * 100),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{formatCurrency(license.cost)}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-gray-700">{formatDate(license.expiry_date)}</div>
                        {license.status === 'expiring_soon' && (
                          <div className="text-xs text-amber-600 mt-0.5">
                            {days > 0 ? `${days}d left` : 'Today'}
                          </div>
                        )}
                        {license.status === 'expired' && (
                          <div className="text-xs text-red-500 mt-0.5">
                            {Math.abs(days)}d ago
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[license.status]}`}>
                          {STATUS_ICONS[license.status]}
                          {STATUS_LABELS[license.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {(() => {
                          const seatsAvail = license.seats_available ?? (license.total_seats - (license.seats_used ?? 0));
                          const requestable = seatsAvail > 0 && license.status !== 'expired';
                          return (
                            <button
                              onClick={() => requestable && setRequestItemContext({
                                id: license.id,
                                type: 'license',
                                label: `${license.software_name} · ${license.vendor}`,
                                assetType: 'software',
                              })}
                              disabled={!requestable}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={requestable ? 'Request a seat' : license.status === 'expired' ? 'License expired' : 'No seats available'}
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                            </button>
                          );
                        })()}
                      </td>
                      {canWrite && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setManagingLicense(license)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                              title="Manage seats"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingLicense(license)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit license"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {pagination && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalCount={pagination.total_count}
            perPage={pagination.per_page}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showRegister && <RegisterLicenseModal onClose={() => setShowRegister(false)} />}
      {editingLicense && <EditLicenseModal license={editingLicense} onClose={() => setEditingLicense(null)} />}
      {managingLicense && <ManageSeatsModal license={managingLicense} onClose={() => setManagingLicense(null)} />}
      {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
      {drawerLicense && (
        <LicenseDetailDrawer
          license={drawerLicense}
          onClose={() => setDrawerLicense(null)}
          onRequestClick={(l) => {
            setDrawerLicense(null);
            setRequestItemContext({
              id: l.id,
              type: 'license',
              label: `${l.software_name} · ${l.vendor}`,
              assetType: 'software',
            });
          }}
        />
      )}
      {requestItemContext && (
        <ItemRequestModal
          itemContext={requestItemContext}
          onClose={() => setRequestItemContext(null)}
        />
      )}
    </AppLayout>
  );
};

export default LicensesPage;
