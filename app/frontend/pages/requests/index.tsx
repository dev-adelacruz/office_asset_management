import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAssetRequests,
  createAssetRequest,
  clearCreateError,
} from '../../state/assetRequests/assetRequestSlice';
import { RootState } from '../../state/store';
import { AssetRequest, AssetRequestStatus, AssetRequestUrgency } from '../../interfaces/state/assetRequestState';
import { CreateAssetRequestParams } from '../../services/assetRequestService';
import AppLayout from '../../components/layout/AppLayout';
import { Plus, ClipboardList, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AssetRequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const STATUS_LABELS: Record<AssetRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_ICONS: Record<AssetRequestStatus, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  rejected: <X className="w-3 h-3" />,
};

const URGENCY_STYLES: Record<AssetRequestUrgency, string> = {
  low: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
  medium: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  high: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

// ─── SubmitRequestModal ───────────────────────────────────────────────────────

interface SubmitRequestModalProps {
  onClose: () => void;
}

const SubmitRequestModal: React.FC<SubmitRequestModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isCreating, createError } = useSelector((s: RootState) => s.assetRequests);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    asset_type: 'physical',
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
    };
    const result = await (dispatch as any)(createAssetRequest(params));
    if (!result.error) handleClose();
  };

  const field = (
    key: keyof typeof form,
    value: string
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transition-all duration-200 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Submit Asset Request</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Asset Type <span className="text-red-500">*</span></label>
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Urgency <span className="text-red-500">*</span></label>
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Justification <span className="text-red-500">*</span></label>
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
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
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

// ─── RequestsPage ─────────────────────────────────────────────────────────────

const RequestsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { requests, isLoading, error } = useSelector((s: RootState) => s.assetRequests);
  const user = useSelector((s: RootState) => s.user.user);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'executive';

  useEffect(() => {
    (dispatch as any)(fetchAssetRequests());
  }, [dispatch]);

  return (
    <AppLayout title="Asset Requests">
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {isManager ? 'All submitted asset requests' : 'Your submitted asset requests'}
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-gray-100">
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No requests yet</p>
            <p className="text-xs text-gray-400">Submit a request to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {isManager && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Requester</th>}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Justification</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgency</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferred Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req: AssetRequest) => (
                  <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                    {isManager && (
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{req.user.name ?? req.user.email}</p>
                          {req.user.name && <p className="text-xs text-gray-400">{req.user.email}</p>}
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {req.asset_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-gray-700 truncate">{req.justification}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${URGENCY_STYLES[req.urgency]}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {req.preferred_fulfillment_date
                        ? new Date(req.preferred_fulfillment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[req.status]}`}>
                        {STATUS_ICONS[req.status]}
                        {STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSubmitModal && <SubmitRequestModal onClose={() => setShowSubmitModal(false)} />}
    </AppLayout>
  );
};

export default RequestsPage;
