import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../state/store';
import { createAsset, clearCreateError } from '../../state/assets/assetSlice';
import AppLayout from '../../components/layout/AppLayout';
import { Package, Hash, DollarSign, MapPin, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { AssetCategory, AssetCondition } from '../../interfaces/state/assetState';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent ' +
  'transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400';

const selectClass =
  'w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent ' +
  'transition-all duration-150 disabled:opacity-50 appearance-none';

const labelClass = 'block text-xs font-medium text-gray-500 mb-1.5';

const Field: React.FC<{ label: string; icon: React.ReactNode; required?: boolean; children: React.ReactNode }> = ({
  label, icon, required, children,
}) => (
  <div>
    <label className={labelClass}>
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>
      {children}
    </div>
  </div>
);

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

const NewAssetPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isCreating, createError } = useSelector((state: RootState) => state.assets);

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
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearCreateError());
    setSaved(false);

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
      setSaved(true);
      setTimeout(() => navigate('/assets'), 1500);
    }
  };

  return (
    <AppLayout title="Register Asset">
      <div className="max-w-3xl space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate('/assets')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assets
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 pt-6 pb-2 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">New Asset</h3>
            <p className="text-xs text-gray-400 mt-0.5">A unique asset code is generated automatically upon registration.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-6">
            {/* Notifications */}
            {createError && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {createError}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Asset registered successfully. Redirecting…
              </div>
            )}

            {/* Required fields */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Required information</p>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Asset name" icon={<Package className="w-4 h-4" />} required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MacBook Pro 14-inch"
                    required
                    disabled={isCreating}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category" icon={<Package className="w-4 h-4" />} required>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AssetCategory)}
                      disabled={isCreating}
                      className={selectClass}
                    >
                      {CATEGORIES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Condition" icon={<Package className="w-4 h-4" />} required>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as AssetCondition)}
                      disabled={isCreating}
                      className={selectClass}
                    >
                      {CONDITIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Serial number" icon={<Hash className="w-4 h-4" />} required>
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

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Purchase date" icon={<Package className="w-4 h-4" />} required>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                      disabled={isCreating}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Purchase cost (₱)" icon={<DollarSign className="w-4 h-4" />} required>
                    <input
                      type="number"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      placeholder="e.g. 89000"
                      min="0"
                      step="0.01"
                      required
                      disabled={isCreating}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Optional fields */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Optional details</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Manufacturer" icon={<Package className="w-4 h-4" />}>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Apple"
                    disabled={isCreating}
                    className={inputClass}
                  />
                </Field>

                <Field label="Model" icon={<Package className="w-4 h-4" />}>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. MBP14,2021"
                    disabled={isCreating}
                    className={inputClass}
                  />
                </Field>

                <Field label="Warranty expiry" icon={<Package className="w-4 h-4" />}>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    disabled={isCreating}
                    className={inputClass}
                  />
                </Field>

                <Field label="Location" icon={<MapPin className="w-4 h-4" />}>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Manila HQ – Floor 3"
                    disabled={isCreating}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Notes" icon={<FileText className="w-4 h-4" />}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this asset…"
                    rows={3}
                    disabled={isCreating}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400 resize-none"
                  />
                </Field>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all duration-150 shadow-md shadow-blue-200"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Registering…
                  </span>
                ) : 'Register Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewAssetPage;
