import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  XCircle,
  Clock,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { fetchDashboard } from '../../state/dashboard/dashboardSlice';
import { RootState } from '../../state/store';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, iconBg, iconColor, accent, isLoading }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    <div className="mt-4">
      {isLoading ? (
        <Skeleton className="h-8 w-16 mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
    <div className={`mt-4 h-1 w-full rounded-full bg-linear-to-r ${accent} opacity-70`} />
  </div>
);

// ─── HomePage ─────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((s: RootState) => s.dashboard);
  const user = useSelector((s: RootState) => s.user.user);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  useEffect(() => {
    dispatch(fetchDashboard() as any);
  }, [dispatch]);

  const statCards = [
    {
      label: 'Total Assets',
      value: data?.assets.total ?? 0,
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accent: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Available Assets',
      value: data?.assets.by_status.available ?? 0,
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Licenses Expiring Soon',
      value: data?.licenses.expiring_soon ?? 0,
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      accent: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Pending Requests',
      value: data?.requests.pending ?? 0,
      icon: ClipboardList,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      accent: 'from-purple-500 to-purple-600',
    },
  ];

  const assetStatuses = data
    ? [
        { label: 'Available', value: data.assets.by_status.available, color: 'bg-emerald-500' },
        { label: 'Assigned', value: data.assets.by_status.assigned, color: 'bg-blue-500' },
        { label: 'Under Maintenance', value: data.assets.by_status.under_maintenance, color: 'bg-amber-400' },
        { label: 'Retired', value: data.assets.by_status.retired, color: 'bg-gray-400' },
        { label: 'Lost', value: data.assets.by_status.lost, color: 'bg-red-500' },
      ]
    : [];

  const total = data?.assets.total ?? 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's a snapshot of your office assets today.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} isLoading={isLoading} />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Asset breakdown by status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Asset Breakdown</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : total === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No assets registered yet.</p>
            ) : (
              <div className="space-y-3">
                {assetStatuses.map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-semibold text-gray-800">{value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: total > 0 ? `${Math.round((value / total) * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* License health */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">License Health</h3>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active', value: data?.licenses.active ?? 0, icon: ShieldCheck, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  { label: 'Expiring Soon', value: data?.licenses.expiring_soon ?? 0, icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700' },
                  { label: 'Expired', value: data?.licenses.expired ?? 0, icon: XCircle, bg: 'bg-red-50', text: 'text-red-700' },
                ].map(({ label, value, icon: Icon, bg, text }) => (
                  <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                    <Icon className={`w-5 h-5 ${text} mx-auto mb-1`} />
                    <p className={`text-xl font-bold ${text}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !data?.recent_activity.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
          ) : (
            <div className="space-y-1">
              {data.recent_activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{item.description}</p>
                    {item.actor_name && (
                      <p className="text-xs text-gray-400 mt-0.5">by {item.actor_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My pending requests */}
        {user?.role === 'employee' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">My Pending Requests</h3>
              <Link to="/requests" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View all
              </Link>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (data?.requests.pending ?? 0) === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No pending requests.</p>
            ) : (
              <p className="text-sm text-gray-600">
                You have <span className="font-semibold text-purple-600">{data?.requests.pending}</span> pending request{(data?.requests.pending ?? 0) !== 1 ? 's' : ''} awaiting approval.{' '}
                <Link to="/requests" className="text-blue-600 hover:underline">View them →</Link>
              </p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HomePage;
