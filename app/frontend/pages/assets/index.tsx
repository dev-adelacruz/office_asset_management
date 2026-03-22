import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { useAppDispatch } from '../../state/hooks';
import { fetchAssets, createAsset, clearCreateError, updateAsset, clearEditError, updateAssetStatus, clearUpdateError, fetchAssignmentLogs, assignAsset, recordAssetReturn, clearAssignError, clearReturnError, clearAssignmentLogs } from '../../state/assets/assetSlice';
import AppLayout from '../../components/layout/AppLayout';
import Pagination from '../../components/Pagination';
import {
  Package, Plus, AlertCircle, Loader2, X, Hash,
  DollarSign, MapPin, FileText, CheckCircle, ChevronDown, AlertTriangle, Pencil,
  Search, Download, History, User, RotateCcw, ClipboardList,
} from 'lucide-react';
import { Asset, AssetAssignmentLog, AssetCategory, AssetCondition, AssetStatus } from '../../interfaces/state/assetState';
import ItemRequestModal, { ItemContext } from '../../components/ItemRequestModal';

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

const REQUESTABLE_STATUS: AssetStatus[] = ['available'];

const AssetRow: React.FC<{
  asset: Asset;
  canChangeStatus: boolean;
  onStatusClick: (asset: Asset) => void;
  onEditClick: (asset: Asset) => void;
  onHistoryClick: (asset: Asset) => void;
  onRowClick: (asset: Asset) => void;
  onRequestClick: (asset: Asset) => void;
}> = ({ asset, canChangeStatus, onStatusClick, onEditClick, onHistoryClick, onRowClick, onRequestClick }) => (
  <tr className="group hover:bg-blue-50/40 transition-colors duration-100">
    <td
      className="px-5 py-3.5 cursor-pointer"
      onClick={() => onRowClick(asset)}
      title="View asset details"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{asset.name}</p>
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
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onHistoryClick(asset)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-purple-500 hover:bg-purple-50 transition-colors duration-150"
          title="Assignment history"
        >
          <History className="w-3.5 h-3.5" />
        </button>
        {canChangeStatus && (
          <button
            onClick={() => onEditClick(asset)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-150"
            title="Edit asset"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => REQUESTABLE_STATUS.includes(asset.status) && onRequestClick(asset)}
          disabled={!REQUESTABLE_STATUS.includes(asset.status)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          title={REQUESTABLE_STATUS.includes(asset.status) ? 'Request this asset' : `Cannot request — asset is ${asset.status.replace('_', ' ')}`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
        </button>
      </div>
    </td>
  </tr>
);

// ─── Registration modal ───────────────────────────────────────────────────────

const RegisterAssetModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
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

// ─── Edit asset modal ─────────────────────────────────────────────────────────

const EditAssetModal: React.FC<{
  asset: Asset | null;
  visible: boolean;
  onClose: () => void;
}> = ({ asset, visible, onClose }) => {
  const dispatch = useAppDispatch();
  const { isEditing, editError } = useSelector((state: RootState) => state.assets);

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

  // Pre-fill from asset whenever it changes
  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setCategory(asset.category);
      setSerialNumber(asset.serial_number);
      setPurchaseDate(asset.purchase_date);
      setPurchaseCost(String(asset.purchase_cost));
      setCondition(asset.condition);
      setManufacturer(asset.manufacturer ?? '');
      setModel(asset.model ?? '');
      setWarrantyExpiry(asset.warranty_expiry ?? '');
      setLocation(asset.location ?? '');
      setNotes(asset.notes ?? '');
      dispatch(clearEditError());
    }
  }, [asset, dispatch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    dispatch(clearEditError());

    const result = await dispatch(updateAsset({
      assetId: asset.id,
      params: {
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
      },
    }));

    if (updateAsset.fulfilled.match(result)) onClose();
  };

  if (!asset) return null;

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
          className={`pointer-events-auto w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-gray-300/50 border border-gray-100 transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
          style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Edit Asset</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{asset.asset_code}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-5">
              {editError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {editError}
                </div>
              )}

              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Required</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Asset name" icon={<Package className="w-4 h-4" />} required span>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Category" icon={<Package className="w-4 h-4" />} required>
                    <select value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)} disabled={isEditing} className={selectClass}>
                      {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </Field>

                  <Field label="Condition" icon={<Package className="w-4 h-4" />} required>
                    <select value={condition} onChange={(e) => setCondition(e.target.value as AssetCondition)} disabled={isEditing} className={selectClass}>
                      {CONDITIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </Field>

                  <Field label="Serial number" icon={<Hash className="w-4 h-4" />} required span>
                    <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Purchase date" icon={<Package className="w-4 h-4" />} required>
                    <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Purchase cost (₱)" icon={<DollarSign className="w-4 h-4" />} required>
                    <input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} min="0" step="0.01" required disabled={isEditing} className={inputClass} />
                  </Field>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Optional</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Manufacturer" icon={<Package className="w-4 h-4" />}>
                    <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Model" icon={<Package className="w-4 h-4" />}>
                    <input type="text" value={model} onChange={(e) => setModel(e.target.value)} disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Warranty expiry" icon={<Package className="w-4 h-4" />}>
                    <input type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Location" icon={<MapPin className="w-4 h-4" />}>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} disabled={isEditing} className={inputClass} />
                  </Field>

                  <Field label="Notes" icon={<FileText className="w-4 h-4" />} span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      disabled={isEditing}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400 resize-none"
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/60 rounded-b-2xl">
              <button type="button" onClick={onClose} disabled={isEditing} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditing}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200/60 transition-all duration-150 disabled:opacity-60"
              >
                {isEditing ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving…</>
                ) : 'Save Changes'}
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
  const dispatch = useAppDispatch();
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

// ─── AssignmentHistoryDrawer ──────────────────────────────────────────────────

const AssignmentHistoryDrawer: React.FC<{
  asset: Asset;
  canAssign: boolean;
  onClose: () => void;
  onAssignClick: () => void;
}> = ({ asset, canAssign, onClose, onAssignClick }) => {
  const dispatch = useAppDispatch();
  const { assignmentLogs, isFetchingHistory, historyError, isReturning } = useSelector((s: RootState) => s.assets);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignmentLogs(asset.id));
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(clearAssignmentLogs());
      onClose();
    }, 250);
  };

  const handleReturn = (log: AssetAssignmentLog) => {
    dispatch(recordAssetReturn({ assetId: asset.id, logId: log.id }));
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white w-full max-w-sm shadow-2xl flex flex-col transition-transform duration-250 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Assignment History</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Asset</p>
          <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{asset.asset_code}</p>
          {canAssign && (
            <button
              onClick={onAssignClick}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <User className="w-3 h-3" />
              Assign to User
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isFetchingHistory ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : historyError ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{historyError}</p>
            </div>
          ) : assignmentLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No assignment history yet.</p>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-6 ml-2">
              {assignmentLogs.map((log: AssetAssignmentLog) => (
                <li key={log.id} className="ml-5">
                  <div className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white ring-1 mt-1 ${log.returned_at ? 'bg-gray-400 ring-gray-200' : 'bg-blue-500 ring-blue-200'}`} />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {new Date(log.assigned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {log.returned_at && (
                        <span className="ml-1">→ {new Date(log.returned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </p>
                    <p className="text-sm font-medium text-gray-900">{log.assigned_to.name ?? log.assigned_to.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">assigned by {log.assigned_by.name ?? log.assigned_by.email}</p>
                    {log.notes && <p className="text-xs text-gray-500 mt-1 italic">"{log.notes}"</p>}
                    {!log.returned_at && canAssign && (
                      <button
                        onClick={() => handleReturn(log)}
                        disabled={isReturning}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Record Return
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── AssignAssetModal ─────────────────────────────────────────────────────────

const AssignAssetModal: React.FC<{
  asset: Asset;
  onClose: () => void;
}> = ({ asset, onClose }) => {
  const dispatch = useAppDispatch();
  const { isAssigning, assignError } = useSelector((s: RootState) => s.assets);
  const [visible, setVisible] = useState(false);
  const [assignedToId, setAssignedToId] = useState('');
  const [assignedAt, setAssignedAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(clearAssignError());
      onClose();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(assignAsset({
      assetId: asset.id,
      params: {
        assigned_to_id: Number(assignedToId),
        assigned_at: assignedAt,
        ...(notes && { notes }),
      },
    }));
    if (!result.error) handleClose();
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transition-all duration-200 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Assign Asset</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
            <p className="font-medium text-gray-900">{asset.name}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{asset.asset_code}</p>
          </div>

          {assignError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{assignError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Assignment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={assignedAt}
              onChange={(e) => setAssignedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isAssigning ? 'Assigning…' : 'Assign Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Asset Detail Drawer ──────────────────────────────────────────────────────

const CONDITION_LABELS_FULL: Record<string, string> = {
  brand_new: 'Brand New', good: 'Good', fair: 'Fair', poor: 'Poor',
};

const AssetDetailDrawer: React.FC<{
  asset: Asset;
  onClose: () => void;
  onRequestClick: (asset: Asset) => void;
}> = ({ asset, onClose, onRequestClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const canRequest = asset.status === 'available';

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white w-full max-w-sm shadow-2xl flex flex-col transition-transform duration-250 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{asset.name}</p>
              <p className="text-xs font-mono text-gray-400">{asset.asset_code}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + Category */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[asset.status] ?? ''}`}>
              {STATUS_LABELS[asset.status] ?? asset.status}
            </span>
            <span className="text-xs text-gray-500 capitalize">{asset.category}</span>
          </div>

          {/* Detail grid */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Manufacturer</dt>
              <dd className="text-gray-800">{asset.manufacturer ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Model</dt>
              <dd className="text-gray-800">{asset.model ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Condition</dt>
              <dd className="text-gray-800">{CONDITION_LABELS_FULL[asset.condition] ?? asset.condition}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Location</dt>
              <dd className="text-gray-800">{asset.location ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Serial Number</dt>
              <dd className="text-gray-800 font-mono text-xs">{asset.serial_number}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Purchase Date</dt>
              <dd className="text-gray-800">{formatDate(asset.purchase_date)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Purchase Cost</dt>
              <dd className="text-gray-800">{formatCurrency(asset.purchase_cost)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-medium text-gray-400 mb-0.5">Warranty Expiry</dt>
              <dd className="text-gray-800">{formatDate(asset.warranty_expiry)}</dd>
            </div>
            {asset.notes && (
              <div className="col-span-2">
                <dt className="text-xs font-medium text-gray-400 mb-0.5">Notes</dt>
                <dd className="text-gray-600 text-xs leading-relaxed">{asset.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Footer — Request CTA */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          {canRequest ? (
            <button
              onClick={() => { handleClose(); onRequestClick(asset); }}
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
                This asset is currently <span className="capitalize font-medium">{asset.status.replace('_', ' ')}</span> and cannot be requested.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AssetsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assets, pagination, isLoading, error } = useSelector((state: RootState) => state.assets);
  const user = useSelector((state: RootState) => state.user.user);

  const canCreate = user?.role === 'manager' || user?.role === 'executive';
  const canChangeStatus = canCreate;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | ''>('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Register modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Edit modal state
  const [editModalAsset, setEditModalAsset] = useState<Asset | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Status change modal state
  const [statusModalAsset, setStatusModalAsset] = useState<Asset | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // Assignment history state
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Asset detail drawer + request modal state
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(null);
  const [requestItemContext, setRequestItemContext] = useState<ItemContext | null>(null);

  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevAssetCount = useRef(assets.length);

  useEffect(() => {
    dispatch(fetchAssets({
      page: currentPage,
      per_page: 25,
      q: searchQuery || undefined,
      category: filterCategory || undefined,
      status: filterStatus || undefined,
      location: filterLocation || undefined,
      purchase_date_from: filterDateFrom || undefined,
      purchase_date_to: filterDateTo || undefined,
    }));
  }, [currentPage, searchQuery, filterCategory, filterStatus, filterLocation, filterDateFrom, filterDateTo]);

  // Detect newly created asset to trigger toast
  useEffect(() => {
    if (prevAssetCount.current > 0 && assets.length > prevAssetCount.current) {
      showToast('Asset registered successfully.');
    }
    prevAssetCount.current = assets.length;
  }, [assets.length]);

  // Detect asset edit to trigger toast
  const prevAssetsRef = useRef<Asset[]>([]);
  useEffect(() => {
    const prev = prevAssetsRef.current;
    if (prev.length > 0) {
      const statusChanged = assets.find((a) => {
        const old = prev.find((p) => p.id === a.id);
        return old && old.status !== a.status;
      });
      if (statusChanged) showToast(`Status updated to "${STATUS_LABELS[statusChanged.status] ?? statusChanged.status}".`);

      const detailsChanged = assets.find((a) => {
        const old = prev.find((p) => p.id === a.id);
        return old && old.status === a.status && old.updated_at !== a.updated_at;
      });
      if (detailsChanged) showToast('Asset details updated successfully.');
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

  const openEditModal = (asset: Asset) => {
    setEditModalAsset(asset);
    setEditModalOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setEditModalVisible(true)));
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setTimeout(() => { setEditModalOpen(false); setEditModalAsset(null); }, 200);
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

  // Filtering is server-side; assets already contains the current page's results
  const filteredAssets = assets;

  const hasActiveFilters = !!(searchQuery || filterCategory || filterStatus || filterLocation || filterDateFrom || filterDateTo);

  const clearFilters = () => {
    setSearchQuery(''); setFilterCategory(''); setFilterStatus('');
    setFilterLocation(''); setFilterDateFrom(''); setFilterDateTo('');
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['asset_code', 'name', 'category', 'serial_number', 'purchase_date',
      'purchase_cost', 'condition', 'status', 'manufacturer', 'model',
      'warranty_expiry', 'location', 'notes'];
    const rows = filteredAssets.map((a) => [
      a.asset_code, a.name, a.category, a.serial_number, a.purchase_date,
      a.purchase_cost, a.condition, a.status, a.manufacturer ?? '',
      a.model ?? '', a.warranty_expiry ?? '', a.location ?? '', a.notes ?? '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
    <>
    <AppLayout title="Assets">
      <SuccessToast visible={toast.visible} message={toast.message} />

      {modalOpen && (
        <RegisterAssetModal visible={modalVisible} onClose={closeModal} />
      )}

      {editModalOpen && (
        <EditAssetModal asset={editModalAsset} visible={editModalVisible} onClose={closeEditModal} />
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

        {/* Search & filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, serial no., or notes…"
                className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 placeholder:text-gray-400"
              />
            </div>
            {/* Toggle filters */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all duration-150 ${
                filtersOpen || (hasActiveFilters && !searchQuery)
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${filtersOpen ? 'rotate-180' : ''}`} />
              Filters
              {hasActiveFilters && (filterCategory || filterStatus || filterLocation || filterDateFrom || filterDateTo) && (
                <span className="ml-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </button>
            {/* Export CSV */}
            <button
              onClick={exportCSV}
              disabled={filteredAssets.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export filtered results to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-150 whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {filtersOpen && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 sm:grid-cols-3 lg:grid-cols-5">
              {/* Category */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value as AssetCategory | ''); setCurrentPage(1); }}
                  className="w-full pl-3 pr-7 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none transition-all duration-150"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value as AssetStatus | ''); setCurrentPage(1); }}
                  className="w-full pl-3 pr-7 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none transition-all duration-150"
                >
                  <option value="">All statuses</option>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Location */}
              <input
                type="text"
                value={filterLocation}
                onChange={(e) => { setFilterLocation(e.target.value); setCurrentPage(1); }}
                placeholder="Location…"
                className="pl-3 pr-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-150 placeholder:text-gray-400"
              />

              {/* Date from */}
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                placeholder="Purchase from"
                className="pl-3 pr-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-150"
              />

              {/* Date to */}
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                placeholder="Purchase to"
                className="pl-3 pr-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-150"
              />
            </div>
          )}
        </div>

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
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No results</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">Clear filters</button>
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
                  <th className="px-5 py-3.5 bg-gray-50/80" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAssets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    canChangeStatus={canChangeStatus}
                    onStatusClick={openStatusModal}
                    onEditClick={openEditModal}
                    onHistoryClick={(a) => setHistoryAsset(a)}
                    onRowClick={(a) => setDrawerAsset(a)}
                    onRequestClick={(a) => setRequestItemContext({
                      id: a.id,
                      type: 'asset',
                      label: `${a.name}${a.category ? ` (${a.category})` : ''}`,
                      assetType: 'physical',
                    })}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={(page) => setCurrentPage(page)}
            totalCount={pagination.total_count}
            perPage={pagination.per_page}
          />
        )}

      </div>
    </AppLayout>

    {historyAsset && (
      <AssignmentHistoryDrawer
        asset={historyAsset}
        canAssign={canCreate}
        onClose={() => setHistoryAsset(null)}
        onAssignClick={() => setShowAssignModal(true)}
      />
    )}
    {showAssignModal && historyAsset && (
      <AssignAssetModal
        asset={historyAsset}
        onClose={() => setShowAssignModal(false)}
      />
    )}
    {drawerAsset && (
      <AssetDetailDrawer
        asset={drawerAsset}
        onClose={() => setDrawerAsset(null)}
        onRequestClick={(a) => {
          setDrawerAsset(null);
          setRequestItemContext({
            id: a.id,
            type: 'asset',
            label: `${a.name}${a.category ? ` (${a.category})` : ''}`,
            assetType: 'physical',
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
    </>
  );
};

export default AssetsPage;
