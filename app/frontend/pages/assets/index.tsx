import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { fetchAssets, createAsset, clearCreateError, updateAssetStatus, clearUpdateError } from '../../state/assets/assetSlice';
import AppLayout from '../../components/layout/AppLayout';
import {
  Package, Plus, AlertCircle, Loader2, X, Hash,
  DollarSign, MapPin, FileText, CheckCircle, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { Asset, AssetCategory, AssetCondition, AssetStatus } from '../../interfaces/state/assetState';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'peripheral', label: 'Peripheral' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
];

const CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: 'brand_new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const CONDITION_LABELS: Record<string, string> = {
  brand_new: 'New', good: 'Good', fair: 'Fair', poor: 'Poor',
};

const STATUS_STYLES: Record<string, string> = {
  available:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  assigned:          'bg-blue-50 text-blue-700 border-blue-200',
  under_maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  retired:           'bg-gray-100 text-gray-500 border-gray-200',
  lost:              'bg-red-50 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  available:         'Available',
  assigned:          'Assigned',
  under_maintenance: 'Under Maintenance',
  retired:           'Retired',
  lost:              'Lost',
};

const ALL_STATUSES: AssetStatus[] = ['available', 'assigned', 'under_maintenance', 'retired', 'lost'];
const DESTRUCTIVE_STATUSES: AssetStatus[] = ['retired', 'lost'];

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputClass =
  'w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent ' +
  'transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400';

const selectClass =
  'w-full pl-10 pr-8 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent ' +
  'transition-all duration-150 disabled:opacity-50 appearance-none cursor-pointer';

const labelClass = 'block text-xs font-medium text-gray-500 mb-1.5';

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  span?: boolean;
}> = ({ label, icon, required, children, span }) => (
  <div className={span ? 'col-span-2' : ''}>
    <label className={labelClass}>
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
        {icon}
      </div>
      {children}
    </div>
  </div>
);

// ─── Asset table row ──────────────────────────────────────────────────────────

const AssetRow: React.FC<{
  asset: Asset;
  canChangeStatus: boolean;
  onStatusClick: (asset: Asset) => void;
}> = ({ asset, canChangeStatus, onStatusClick }) => (
  <tr className="group hover:bg-blue-50/40 transition-colors duration-100">
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{asset.name}</p>
          <p className="text-xs text-gray-400 font-mono">{asset.asset_code}</p>
        </div>
      </div>
    </td>
    <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">{asset.category}</td>
    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono tracking-wide">{asset.serial_number}</td>
    <td className="px-5 py-3.5 text-sm text-gray-500">{CONDITION_LABELS[asset.condition] ?? asset.condition}</td>
    <td className="px-5 py-3.5">
      {canChangeStatus ? (
        <button
          onClick={() => onStatusClick(asset)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-150 hover:brightness-95 hover:shadow-sm cursor-pointer ${STATUS_STYLES[asset.status] ?? ''}`}
          title="Click to change status"
        >
          {STATUS_LABELS[asset.status] ?? asset.status}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      ) : (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[asset.status] ?? ''}`}>
          {STATUS_LABELS[asset.status] ?? asset.status}
        </span>
      )}
    </td>
    <td className="px-5 py-3.5 text-sm text-gray-400">{asset.location ?? '—'}</td>
  </tr>
);

// ─── Registration modal ───────────────────────────────────────────────────────

const RegisterAssetModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isCreating, createError } = useSelector((state: RootState) => state.assets);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('brand_new');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [visible]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const resetForm = () => {
    setName(''); setCategory('laptop'); setSerialNumber('');
    setPurchaseDate(''); setPurchaseCost(''); setCondition('brand_new');
    setManufacturer(''); setModel(''); setWarrantyExpiry('');
    setLocation(''); setNotes('');
    dispatch(clearCreateError());
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearCreateError());

    const result = await dispatch(createAsset({
      name,
      category,
      serial_number: serialNumber,
      purchase_date: purchaseDate,
      purchase_cost: parseFloat(purchaseCost),
      condition,
      ...(manufacturer && { manufacturer }),
      ...(model && { model }),
      ...(warrantyExpiry && { warranty_expiry: warrantyExpiry }),
      ...(location && { location }),
      ...(notes && { notes }),
    }));

    if (createAsset.fulfilled.match(result)) {
      resetForm();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-gray-300/50 border border-gray-100 transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
          style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Register New Asset</h2>
              <p className="text-xs text-gray-400 mt-0.5">A unique asset code is generated automatically.</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-5">

              {/* Error */}
              {createError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {createError}
                </div>
              )}

              {/* Required */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Required</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Asset name" icon={<Package className="w-4 h-4" />} required span>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. MacBook Pro 14-inch"
                      required
                      disabled={isCreating}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Category" icon={<Package className="w-4 h-4" />} required>
                    <select value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)} disabled={isCreating} className={selectClass}>
                      {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </Field>

                  <Field label="Condition" icon={<Package className="w-4 h-4" />} required>
                    <select value={condition} onChange={(e) => setCondition(e.target.value as AssetCondition)} disabled={isCreating} className={selectClass}>
                      {CONDITIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </Field>

                  <Field label="Serial number" icon={<Hash className="w-4 h-4" />} required span>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. C02XG0J5JGH5"
                      required
                      disabled={isCreating}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Purchase date" icon={<Package className="w-4 h-4" />} required>
                    <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required disabled={isCreating} className={inputClass} />
                  </Field>

                  <Field label="Purchase cost (₱)" icon={<DollarSign className="w-4 h-4" />} required>
                    <input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} placeholder="e.g. 89000" min="0" step="0.01" required disabled={isCreating} className={inputClass} />
                  </Field>
                </div>
              </div>

              {/* Optional */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Optional</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Manufacturer" icon={<Package className="w-4 h-4" />}>
                    <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g. Apple" disabled={isCreating} className={inputClass} />
                  </Field>

                  <Field label="Model" icon={<Package className="w-4 h-4" />}>
                    <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. MBP14,2024" disabled={isCreating} className={inputClass} />
                  </Field>

                  <Field label="Warranty expiry" icon={<Package className="w-4 h-4" />}>
                    <input type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} disabled={isCreating} className={inputClass} />
                  </Field>

                  <Field label="Location" icon={<MapPin className="w-4 h-4" />}>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Manila HQ – Floor 3" disabled={isCreating} className={inputClass} />
                  </Field>

                  <Field label="Notes" icon={<FileText className="w-4 h-4" />} span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes…"
                      rows={2}
                      disabled={isCreating}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400 resize-none"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/60 rounded-b-2xl">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200/60 transition-all duration-150 disabled:opacity-60"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Registering…
                  </>
                ) : 'Register Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── Status change modal ──────────────────────────────────────────────────────

const StatusChangeModal: React.FC<{
  asset: Asset | null;
  visible: boolean;
  onClose: () => void;
}> = ({ asset, visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isUpdating, updateError } = useSelector((state: RootState) => state.assets);

  const [selected, setSelected] = useState<AssetStatus | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) { setSelected(null); setConfirming(false); dispatch(clearUpdateError()); }
  }, [visible, dispatch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = (status: AssetStatus) => {
    setSelected(status);
    if (DESTRUCTIVE_STATUSES.includes(status)) {
      setConfirming(true);
    }
  };

  const handleApply = async () => {
    if (!asset || !selected) return;
    dispatch(clearUpdateError());
    const result = await dispatch(updateAssetStatus({ assetId: asset.id, status: selected }));
    if (updateAssetStatus.fulfilled.match(result)) onClose();
  };

  if (!asset) return null;

  const availableStatuses = ALL_STATUSES.filter((s) => s !== asset.status);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-gray-300/50 border border-gray-100 transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Change Status</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-50">{asset.name}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            {updateError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {updateError}
              </div>
            )}

            {!confirming ? (
              <>
                <p className="text-xs text-gray-500">Select a new status for this asset:</p>
                <div className="space-y-2">
                  {availableStatuses.map((status) => {
                    const isDestructive = DESTRUCTIVE_STATUSES.includes(status);
                    return (
                      <button
                        key={status}
                        onClick={() => handleSelect(status)}
                        disabled={isUpdating}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 disabled:opacity-50 ${
                          selected === status
                            ? `${STATUS_STYLES[status]} border-current`
                            : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>{STATUS_LABELS[status]}</span>
                        {isDestructive && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Mark as {STATUS_LABELS[selected!]}?
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {selected === 'lost'
                        ? 'This asset will be removed from active inventory and marked as lost.'
                        : 'Retired assets are excluded from active inventory counts.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => confirming ? setConfirming(false) : onClose()}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
            >
              {confirming ? 'Back' : 'Cancel'}
            </button>
            {confirming ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200/60 transition-all duration-150 disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Confirm
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                disabled={!selected || isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200/60 transition-all duration-150 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Success toast ────────────────────────────────────────────────────────────

const SuccessToast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => (
  <div
    className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
    }`}
  >
    <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-300/40">
      <CheckCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const AssetsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { assets, isLoading, error } = useSelector((state: RootState) => state.assets);
  const user = useSelector((state: RootState) => state.user.user);

  const canCreate = user?.role === 'manager' || user?.role === 'executive';
  const canChangeStatus = canCreate;

  // Register modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Status change modal state
  const [statusModalAsset, setStatusModalAsset] = useState<Asset | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevAssetCount = useRef(assets.length);

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  // Detect newly created asset to trigger toast
  useEffect(() => {
    if (assets.length > prevAssetCount.current) {
      showToast('Asset registered successfully.');
    }
    prevAssetCount.current = assets.length;
  }, [assets.length]);

  // Detect status update to trigger toast
  const prevAssetsRef = useRef<Asset[]>([]);
  useEffect(() => {
    const prev = prevAssetsRef.current;
    if (prev.length > 0) {
      const changed = assets.find((a) => {
        const old = prev.find((p) => p.id === a.id);
        return old && old.status !== a.status;
      });
      if (changed) showToast(`Status updated to "${STATUS_LABELS[changed.status] ?? changed.status}".`);
    }
    prevAssetsRef.current = assets;
  }, [assets]);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  const openModal = () => {
    setModalOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalOpen(false), 200);
  };

  const openStatusModal = (asset: Asset) => {
    setStatusModalAsset(asset);
    setStatusModalOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setStatusModalVisible(true)));
  };

  const closeStatusModal = () => {
    setStatusModalVisible(false);
    setTimeout(() => { setStatusModalOpen(false); setStatusModalAsset(null); }, 200);
  };

  // Stats summary — retired and lost excluded from "active" count per AC
  const activeAssets = assets.filter((a) => a.status !== 'retired' && a.status !== 'lost');
  const stats = [
    { label: 'Active', value: activeAssets.length, color: 'text-gray-900' },
    { label: 'Available', value: assets.filter((a) => a.status === 'available').length, color: 'text-emerald-600' },
    { label: 'Assigned', value: assets.filter((a) => a.status === 'assigned').length, color: 'text-blue-600' },
    { label: 'Maintenance', value: assets.filter((a) => a.status === 'under_maintenance').length, color: 'text-amber-600' },
  ];

  return (
    <AppLayout title="Assets">
      <SuccessToast visible={toast.visible} message={toast.message} />

      {modalOpen && (
        <RegisterAssetModal visible={modalVisible} onClose={closeModal} />
      )}

      {statusModalOpen && (
        <StatusChangeModal asset={statusModalAsset} visible={statusModalVisible} onClose={closeStatusModal} />
      )}

      <div className="space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Asset Inventory</h2>
            <p className="text-sm text-gray-400 mt-0.5">All registered company assets</p>
          </div>
          {canCreate && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200/60 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Register Asset
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-medium text-gray-400">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading assets…</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No assets yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                {canCreate ? 'Click "Register Asset" to add the first one to the inventory.' : 'No assets have been registered yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">Asset</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">Category</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">Serial No.</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">Condition</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    canChangeStatus={canChangeStatus}
                    onStatusClick={openStatusModal}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AppLayout>
  );
};

export default AssetsPage;
