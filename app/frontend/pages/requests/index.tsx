import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAssetRequests,
  fetchAssetRequest,
  createAssetRequest,
  updateAssetRequest,
  clearCreateError,
  clearUpdateError,
  clearCurrentRequest,
} from '../../state/assetRequests/assetRequestSlice';
import { RootState } from '../../state/store';
import { AssetRequest, AssetRequestStatus, AssetRequestUrgency, AssetRequestStatusLog } from '../../interfaces/state/assetRequestState';
import { CreateAssetRequestParams } from '../../services/assetRequestService';
import AppLayout from '../../components/layout/AppLayout';
import Pagination from '../../components/Pagination';
import { Plus, ClipboardList, X, AlertTriangle, CheckCircle, Clock, ThumbsUp, ThumbsDown, History } from 'lucide-react';

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

// ─── RejectModal ──────────────────────────────────────────────────────────────

interface RejectModalProps {
  request: AssetRequest;
  onClose: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ request, onClose }) => {
  const dispatch = useDispatch();
  const { isUpdating, updateError } = useSelector((s: RootState) => s.assetRequests);
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
    dispatch(clearUpdateError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await (dispatch as any)(
      updateAssetRequest({ requestId: request.id, params: { status: 'rejected', notes } })
    );
    if (!result.error) handleClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transition-all duration-200 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Reject Request</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
            <p className="font-medium truncate">{request.user.name ?? request.user.email}</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{request.justification}</p>
          </div>

          {updateError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{updateError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Explain why the request is being rejected..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !notes.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Rejecting…' : 'Reject Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

// ─── TimelineDrawer ───────────────────────────────────────────────────────────

interface TimelineDrawerProps {
  onClose: () => void;
}

const TimelineDrawer: React.FC<TimelineDrawerProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { currentRequest, isFetchingTimeline, timelineError } = useSelector((s: RootState) => s.assetRequests);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(clearCurrentRequest());
      onClose();
    }, 250);
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative bg-white w-full max-w-sm shadow-2xl flex flex-col transition-transform duration-250 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Status Timeline</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Request summary */}
        {currentRequest && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Request</p>
            <p className="text-sm font-medium text-gray-900 truncate">{currentRequest.justification}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-500 capitalize">{currentRequest.asset_type}</span>
              <span className="text-gray-300">·</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[currentRequest.status]}`}>
                {STATUS_ICONS[currentRequest.status]}
                {STATUS_LABELS[currentRequest.status]}
              </span>
            </div>
          </div>
        )}

        {/* Timeline body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isFetchingTimeline ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : timelineError ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{timelineError}</p>
            </div>
          ) : currentRequest?.status_logs?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No status history yet.</p>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-6 ml-2">
              {currentRequest?.status_logs?.map((log: AssetRequestStatusLog) => (
                <li key={log.id} className="ml-5">
                  <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-200 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {log.from_status ? (
                        <span>
                          <span className="capitalize">{log.from_status}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="capitalize">{log.to_status}</span>
                        </span>
                      ) : (
                        <span className="capitalize">{log.to_status}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {log.changed_by.name ?? log.changed_by.email}
                    </p>
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

// ─── RequestsPage ─────────────────────────────────────────────────────────────

const RequestsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { requests, pagination, isLoading, isUpdating, error } = useSelector((s: RootState) => s.assetRequests);
  const user = useSelector((s: RootState) => s.user.user);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AssetRequest | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isManager = user?.role === 'manager' || user?.role === 'executive';

  useEffect(() => {
    (dispatch as any)(fetchAssetRequests({ page: currentPage, per_page: 25 }));
  }, [dispatch, currentPage]);

  const handleApprove = async (req: AssetRequest) => {
    await (dispatch as any)(updateAssetRequest({ requestId: req.id, params: { status: 'approved' } }));
  };

  const handleViewTimeline = (req: AssetRequest) => {
    (dispatch as any)(fetchAssetRequest(req.id));
    setShowTimeline(true);
  };

  return (
    <AppLayout title="Asset Requests">
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isManager ? 'All submitted asset requests — sorted by urgency' : 'Your submitted asset requests'}
          </p>
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
                  <th className="px-5 py-3" />
                  {isManager && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
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
                      {req.notes && req.status !== 'pending' && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">Note: {req.notes}</p>
                      )}
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
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleViewTimeline(req)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View timeline"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    {isManager && (
                      <td className="px-5 py-3.5">
                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(req)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              <ThumbsDown className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      {showSubmitModal && <SubmitRequestModal onClose={() => setShowSubmitModal(false)} />}
      {rejectTarget && <RejectModal request={rejectTarget} onClose={() => setRejectTarget(null)} />}
      {showTimeline && <TimelineDrawer onClose={() => setShowTimeline(false)} />}
    </AppLayout>
  );
};

export default RequestsPage;
