import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../state/hooks';
import { createAssetRequest, clearCreateError } from '../state/assetRequests/assetRequestSlice';
import { RootState } from '../state/store';
import { CreateAssetRequestParams } from '../services/assetRequestService';
import { AlertTriangle, Package, ShieldCheck, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ItemContext {
  id: number;
  type: 'asset' | 'license';
  label: string;
  assetType: 'physical' | 'software';
}

interface ItemRequestModalProps {
  onClose: () => void;
  itemContext?: ItemContext;
}

// ─── ItemRequestModal ─────────────────────────────────────────────────────────

const ItemRequestModal: React.FC<ItemRequestModalProps> = ({ onClose, itemContext }) => {
  const dispatch = useAppDispatch();
  const { isCreating, createError } = useSelector((s: RootState) => s.assetRequests);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    asset_type: itemContext?.assetType ?? 'physical',
    justification: '',
    urgency: 'medium',
    preferred_fulfillment_date: '',
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
    const params: CreateAssetRequestParams = {
      asset_type: form.asset_type,
      justification: form.justification,
      urgency: form.urgency,
      ...(form.preferred_fulfillment_date && { preferred_fulfillment_date: form.preferred_fulfillment_date }),
      ...(form.notes && { notes: form.notes }),
      ...(itemContext?.type === 'asset' && { asset_id: itemContext.id }),
      ...(itemContext?.type === 'license' && { license_id: itemContext.id }),
    };
    const result = await dispatch(createAssetRequest(params));
    if (!result.error) handleClose();
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transition-all duration-200 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Submit Asset Request</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {createError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{createError}</p>
            </div>
          )}

          {/* Pre-filled item context (read-only) */}
          {itemContext && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Item</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200">
                {itemContext.type === 'asset' ? (
                  <Package className="w-4 h-4 text-blue-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span className="text-sm font-medium text-blue-800 truncate">{itemContext.label}</span>
                <span className="ml-auto text-xs text-blue-500 shrink-0 capitalize">{itemContext.type}</span>
              </div>
            </div>
          )}

          <div className={`grid gap-4 ${itemContext ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {!itemContext && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Asset Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.asset_type}
                  onChange={(e) => field('asset_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  required
                >
                  <option value="physical">Physical Asset</option>
                  <option value="software">Software License</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Urgency <span className="text-red-500">*</span>
              </label>
              <select
                value={form.urgency}
                onChange={(e) => field('urgency', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.justification}
              onChange={(e) => field('justification', e.target.value)}
              rows={3}
              placeholder="Describe why you need this asset..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Preferred Fulfillment Date</label>
            <input
              type="date"
              value={form.preferred_fulfillment_date}
              onChange={(e) => field('preferred_fulfillment_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Additional Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => field('notes', e.target.value)}
              rows={2}
              placeholder="Any additional context..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemRequestModal;
