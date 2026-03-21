import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../state/store';
import { fetchAssets } from '../../state/assets/assetSlice';
import AppLayout from '../../components/layout/AppLayout';
import { Package, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Asset } from '../../interfaces/state/assetState';

const CONDITION_LABELS: Record<string, string> = {
  brand_new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  under_maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  retired: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  assigned: 'Assigned',
  under_maintenance: 'Under Maintenance',
  retired: 'Retired',
};

const AssetRow: React.FC<{ asset: Asset }> = ({ asset }) => (
  <tr className="hover:bg-gray-50 transition-colors duration-100">
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{asset.name}</p>
          <p className="text-xs text-gray-400">{asset.asset_code}</p>
        </div>
      </div>
    </td>
    <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">{asset.category}</td>
    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{asset.serial_number}</td>
    <td className="px-5 py-3.5 text-sm text-gray-500">{CONDITION_LABELS[asset.condition] ?? asset.condition}</td>
    <td className="px-5 py-3.5">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[asset.status] ?? ''}`}>
        {STATUS_LABELS[asset.status] ?? asset.status}
      </span>
    </td>
    <td className="px-5 py-3.5 text-sm text-gray-500">{asset.location ?? '—'}</td>
  </tr>
);

const AssetsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { assets, isLoading, error } = useSelector((state: RootState) => state.assets);
  const user = useSelector((state: RootState) => state.user.user);

  const canCreate = user?.role === 'manager' || user?.role === 'executive';

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  return (
    <AppLayout title="Assets">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Asset Inventory</h2>
            <p className="text-sm text-gray-400 mt-0.5">{assets.length} asset{assets.length !== 1 ? 's' : ''} registered</p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate('/assets/new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Register Asset
            </button>
          )}
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
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading assets…</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="w-10 h-10 mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No assets registered yet</p>
              {canCreate && (
                <p className="text-xs text-gray-400 mt-1">Click "Register Asset" to add the first one.</p>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Serial No.</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Condition</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} />
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
