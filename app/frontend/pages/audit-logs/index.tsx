import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/hooks';
import { fetchAuditLogs } from '../../state/auditLogs/auditLogSlice';
import { RootState } from '../../state/store';
import { AuditLog } from '../../interfaces/state/auditLogState';
import AppLayout from '../../components/layout/AppLayout';
import Pagination from '../../components/Pagination';
import { ScrollText, Filter, X } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  update: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  destroy: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const AUDITABLE_TYPES = ['Asset', 'License', 'AssetRequest'];
const ACTION_TYPES = ['create', 'update', 'destroy'];

// ─── ChangesPanel ─────────────────────────────────────────────────────────────

interface ChangesPanelProps {
  log: AuditLog;
  onClose: () => void;
}

const ChangesPanel: React.FC<ChangesPanelProps> = ({ log, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const fields =
    log.action === 'create'
      ? Object.keys(log.changes_after)
      : log.action === 'destroy'
      ? Object.keys(log.changes_before)
      : Object.keys({ ...log.changes_before, ...log.changes_after });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-xl transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Change Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {log.auditable_type} #{log.auditable_id} — {log.action}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {fields.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No field changes recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <th className="text-left pb-2 w-1/3">Field</th>
                  <th className="text-left pb-2 w-1/3">Before</th>
                  <th className="text-left pb-2 w-1/3">After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fields.map((field) => (
                  <tr key={field}>
                    <td className="py-2 pr-3 font-medium text-gray-700 truncate">{field}</td>
                    <td className="py-2 pr-3 text-gray-500 truncate">
                      {log.changes_before[field] != null
                        ? String(log.changes_before[field])
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2 text-gray-900 truncate">
                      {log.changes_after[field] != null
                        ? String(log.changes_after[field])
                        : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Actor: {log.actor?.name ?? log.actor?.email ?? 'System'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(log.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── AuditLogsPage ────────────────────────────────────────────────────────────

const AuditLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { audit_logs, pagination, isLoading, error } = useSelector((s: RootState) => s.auditLogs);

  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const buildFilters = (page: number) => ({
    actor_id: actorFilter || undefined,
    action_type: actionFilter || undefined,
    auditable_type: typeFilter || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    page,
  });

  const applyFilters = () => {
    setCurrentPage(1);
    dispatch(fetchAuditLogs(buildFilters(1)));
  };

  const clearFilters = () => {
    setActorFilter('');
    setActionFilter('');
    setTypeFilter('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    dispatch(fetchAuditLogs({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(fetchAuditLogs(buildFilters(page)));
  };

  useEffect(() => {
    dispatch(fetchAuditLogs({ page: 1 }));
  }, [dispatch]);

  const hasFilters = actorFilter || actionFilter || typeFilter || fromDate || toDate;

  return (
    <AppLayout title="Audit Log">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100">
            <ScrollText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">System Audit Log</h1>
            <p className="text-sm text-gray-500">All create, update, and delete actions across the platform</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Actor ID"
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All actions</option>
              {ACTION_TYPES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All types</option>
              {AUDITABLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={applyFilters}
              className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-gray-400">Loading audit logs…</div>
          ) : error ? (
            <div className="p-12 text-center text-sm text-red-500">{error}</div>
          ) : audit_logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">No audit log entries found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Resource</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audit_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.auditable_type} <span className="text-gray-400">#{log.auditable_id}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.actor?.name ?? log.actor?.email ?? <span className="text-gray-400">System</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(log)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View changes
                      </button>
                    </td>
                  </tr>
                ))}
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
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {selected && <ChangesPanel log={selected} onClose={() => setSelected(null)} />}
    </AppLayout>
  );
};

export default AuditLogsPage;
