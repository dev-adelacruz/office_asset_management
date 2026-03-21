import React from 'react';
import {
  TrendingUp, Users, ShoppingCart, DollarSign,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';

const statCards = [
  {
    label: 'Total Revenue',
    value: '$48,295',
    change: '+12.5%',
    up: true,
    icon: DollarSign,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accent: 'from-blue-500 to-blue-600',
  },
  {
    label: 'Active Users',
    value: '3,842',
    change: '+8.1%',
    up: true,
    icon: Users,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    accent: 'from-indigo-500 to-indigo-600',
  },
  {
    label: 'New Orders',
    value: '1,209',
    change: '-3.2%',
    up: false,
    icon: ShoppingCart,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    accent: 'from-purple-500 to-purple-600',
  },
  {
    label: 'Growth Rate',
    value: '24.6%',
    change: '+4.9%',
    up: true,
    icon: TrendingUp,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accent: 'from-emerald-500 to-emerald-600',
  },
];

const HomePage: React.FC = () => {
  return (
    <AppLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good morning 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your projects today.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(({ label, value, change, up, icon: Icon, iconBg, iconColor, accent }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${iconBg}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
              <div className={`mt-4 h-1 w-full rounded-full bg-linear-to-r ${accent} opacity-70`} />
            </div>
          ))}
        </div>

        {/* Placeholder content block */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {['New user registered', 'Order #1042 completed', 'Monthly report generated', 'System backup succeeded'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <p className="text-sm text-gray-600">{item}</p>
                <span className="ml-auto text-xs text-gray-400">{i + 1}h ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomePage;
