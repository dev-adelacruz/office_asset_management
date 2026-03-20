import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../state/user/userSlice';
import { RootState } from '../../state/store';
import {
  LayoutDashboard, User, Settings, LogOut, Bell,
  ChevronDown, Zap, TrendingUp, Users, ShoppingCart,
  DollarSign, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

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

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Profile', icon: User, active: false },
  { label: 'Settings', icon: Settings, active: false },
];

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-700/60">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-900/50">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">AppName</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5 mr-3 shrink-0" />
              {label}
            </a>
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">Dashboard Overview</h1>
            <p className="text-xs text-gray-400">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User pill + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium text-gray-700 max-w-[140px] truncate leading-tight">{user?.email}</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-px rounded-full leading-tight tracking-wide">Administrator</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/60 overflow-hidden z-50">
                  {/* Account info header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      Profile
                    </button>
                    <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                      <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                      Settings
                    </button>
                  </div>

                  {/* Divider + Sign out */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      up
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-500'
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
                <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${accent} opacity-70`} />
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
        </main>
      </div>
    </div>
  );
};

export default HomePage;
