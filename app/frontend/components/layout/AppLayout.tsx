import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../state/user/userSlice';
import { fetchNotifications, markNotificationRead } from '../../state/notifications/notificationSlice';
import { RootState } from '../../state/store';
import {
  LayoutDashboard, User, Settings, LogOut, Bell,
  ChevronDown, Zap, Package, ShieldCheck, ClipboardList,
  AlertTriangle, X, ScrollText,
} from 'lucide-react';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: null },
  { label: 'Assets', icon: Package, path: '/assets', roles: null },
  { label: 'Licenses', icon: ShieldCheck, path: '/licenses', roles: null },
  { label: 'Requests', icon: ClipboardList, path: '/requests', roles: null },
  { label: 'Audit Log', icon: ScrollText, path: '/audit-logs', roles: ['executive'] },
  { label: 'Profile', icon: User, path: '/profile', roles: null },
  { label: 'Settings', icon: Settings, path: '/settings', roles: null },
];

const AppLayout: React.FC<AppLayoutProps> = ({ title, children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user.user);
  const { notifications, unread_count } = useSelector((state: RootState) => state.notifications);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const displayName = user?.name ?? user?.email ?? '';

  useEffect(() => {
    dispatch(fetchNotifications() as any);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id: number) => {
    dispatch(markNotificationRead(id) as any);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-700/60">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-900/50">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">DeskDex</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.filter(({ roles }) => !roles || roles.includes(user?.role ?? '')).map(({ label, icon: Icon, path }) => {
            const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5 mr-3 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150"
              >
                <Bell className="w-5 h-5" />
                {unread_count > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white leading-none">
                    {unread_count > 9 ? '9+' : unread_count}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/60 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Notifications</p>
                    {unread_count > 0 && (
                      <span className="text-xs text-blue-600 font-medium">{unread_count} unread</span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                            n.read ? 'bg-white' : 'bg-amber-50/60'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <AlertTriangle className={`w-4 h-4 ${n.read ? 'text-gray-300' : 'text-amber-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold leading-tight ${n.read ? 'text-gray-500' : 'text-gray-800'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Mark as read"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
                  <span className="text-sm font-medium text-gray-700 max-w-35 truncate leading-tight">{displayName}</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-px rounded-full leading-tight tracking-wide capitalize">{user?.role}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/60 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                    {user?.office_location && (
                      <p className="text-xs text-gray-400 truncate">{user.office_location}</p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                      className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      Profile
                    </button>
                    <button className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                      <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                      Settings
                    </button>
                  </div>

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

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
