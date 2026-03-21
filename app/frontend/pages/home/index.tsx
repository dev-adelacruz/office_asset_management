import React, { useEffect, useState } from 'react';
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
  DollarSign,
  BarChart2,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { fetchDashboard } from '../../state/dashboard/dashboardSlice';
import { RootState } from '../../state/store';
import { DashboardPeriod } from '../../interfaces/state/dashboardState';

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

// ─── DonutChart ───────────────────────────────────────────────────────────────

interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

const DonutChart: React.FC<{ slices: DonutSlice[]; total: number }> = ({ slices, total }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  if (total === 0) {
    return (
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="18" />
      </svg>
    );
  }

  const segments = slices.map((slice) => {
    const percent = slice.value / total;
    const offset = circumference * (1 - cumulativePercent);
    const dashArray = `${circumference * percent} ${circumference * (1 - percent)}`;
    cumulativePercent += percent;
    return { ...slice, offset, dashArray };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth="18"
          strokeDasharray={seg.dashArray}
          strokeDashoffset={seg.offset}
        />
      ))}
    </svg>
  );
};

// ─── BarChart ─────────────────────────────────────────────────────────────────

interface BarChartItem {
  label: string;
  value: number;
  color: string;
}

const BarChart: React.FC<{ items: BarChartItem[]; max: number }> = ({ items, max }) => (
  <div className="space-y-2.5">
    {items.map(({ label, value, color }) => (
      <div key={label}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600 capitalize">{label}</span>
          <span className="text-sm font-semibold text-gray-800">{value}</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: max > 0 ? `${Math.round((value / max) * 100)}%` : '0%' }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ─── PERIOD_OPTIONS ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: DashboardPeriod | ''; label: string }[] = [
  { value: '', label: 'All Time' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
];

// ─── HomePage ─────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((s: RootState) => s.dashboard);
  const user = useSelector((s: RootState) => s.user.user);
  const isExecutive = user?.role === 'executive';

  const [period, setPeriod] = useState<DashboardPeriod | ''>('');

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  useEffect(() => {
    dispatch(fetchDashboard(period || undefined) as any);
  }, [dispatch, period]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const statCards = [
    {
      label: 'Total Assets',
      value: data?.assets.total ?? 0,
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accent: 'from-blue-500 to-blue-600',
    },
    ...(isExecutive
      ? [{
          label: 'Total Asset Value',
          value: data ? formatCurrency(data.assets.total_value) : '—',
          icon: DollarSign,
          iconBg: 'bg-teal-100',
          iconColor: 'text-teal-600',
          accent: 'from-teal-500 to-teal-600',
        }]
      : [{
          label: 'Available Assets',
          value: data?.assets.by_status.available ?? 0,
          icon: CheckCircle,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          accent: 'from-emerald-500 to-emerald-600',
        }]
    ),
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

  const categoryItems: BarChartItem[] = data
    ? [
        { label: 'Laptop', value: data.assets.by_category.laptop, color: 'bg-blue-500' },
        { label: 'Monitor', value: data.assets.by_category.monitor, color: 'bg-indigo-500' },
        { label: 'Peripheral', value: data.assets.by_category.peripheral, color: 'bg-violet-400' },
        { label: 'Furniture', value: data.assets.by_category.furniture, color: 'bg-amber-400' },
        { label: 'Other', value: data.assets.by_category.other, color: 'bg-gray-400' },
      ]
    : [];

  const maxCategory = Math.max(...categoryItems.map((c) => c.value), 1);

  const total = data?.assets.total ?? 0;

  const licenseDonutSlices: DonutSlice[] = data
    ? [
        { label: 'Active', value: data.licenses.active, color: '#10b981' },
        { label: 'Expiring Soon', value: data.licenses.expiring_soon, color: '#f59e0b' },
        { label: 'Expired', value: data.licenses.expired, color: '#ef4444' },
      ]
    : [];

  const licenseTotal = data ? data.licenses.active + data.licenses.expiring_soon + data.licenses.expired : 0;
  const usedSeats = data?.licenses.utilization.used_seats ?? 0;
  const totalSeats = data?.licenses.utilization.total_seats ?? 0;
  const utilizationPct = totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h2>
            <p className="text-sm text-gray-500 mt-0.5">Here's a snapshot of your office assets today.</p>
          </div>

          {/* Period selector — executive only */}
          {isExecutive && (
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as DashboardPeriod | '')}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} isLoading={isLoading} />
          ))}
        </div>

        {/* Executive: period spend summary */}
        {isExecutive && period && data && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">
                {PERIOD_OPTIONS.find((o) => o.value === period)?.label} Summary
              </p>
              <p className="text-xs text-blue-500 mt-0.5">New assets added in selected period</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-800">{data.assets.period_additions}</p>
              <p className="text-sm text-blue-600">{formatCurrency(data.assets.period_spend)} spent</p>
            </div>
          </div>
        )}

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
              <>
                <div className="flex items-center gap-6">
                  <DonutChart slices={licenseDonutSlices} total={licenseTotal} />
                  <div className="space-y-2 flex-1">
                    {[
                      { label: 'Active', value: data?.licenses.active ?? 0, color: 'bg-emerald-500', text: 'text-emerald-700' },
                      { label: 'Expiring Soon', value: data?.licenses.expiring_soon ?? 0, color: 'bg-amber-400', text: 'text-amber-700' },
                      { label: 'Expired', value: data?.licenses.expired ?? 0, color: 'bg-red-500', text: 'text-red-700' },
                    ].map(({ label, value, color, text }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                        <span className="text-sm text-gray-600 flex-1">{label}</span>
                        <span className={`text-sm font-semibold ${text}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat utilization — executive only */}
                {isExecutive && (
                  <div className="mt-5 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-600">Seat Utilization</span>
                      <span className="text-sm font-semibold text-gray-800">{usedSeats} / {totalSeats}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${utilizationPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{utilizationPct}% of seats in use</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Executive: asset category breakdown */}
        {isExecutive && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Assets by Category</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : total === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No assets registered yet.</p>
            ) : (
              <BarChart items={categoryItems} max={maxCategory} />
            )}
          </div>
        )}

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
