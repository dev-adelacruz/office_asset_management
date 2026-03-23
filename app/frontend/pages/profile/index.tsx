import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import ProfileForm from '../../components/profile/ProfileForm';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import ChangeEmailForm from '../../components/profile/ChangeEmailForm';
import AppLayout from '../../components/layout/AppLayout';
import { Mail, Phone, MapPin, Shield, Calendar, Building2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const roleColor: Record<string, { badge: string; accent: string; banner: string }> = {
    executive: {
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      accent: 'from-amber-500 to-orange-500',
      banner: 'from-amber-600 via-orange-500 to-red-500',
    },
    manager: {
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      accent: 'from-indigo-500 to-blue-500',
      banner: 'from-indigo-600 via-blue-500 to-cyan-500',
    },
    employee: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      accent: 'from-emerald-500 to-teal-500',
      banner: 'from-blue-600 via-indigo-500 to-purple-500',
    },
  };

  const roleTheme = roleColor[user?.role ?? ''] ?? {
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    accent: 'from-gray-500 to-gray-600',
    banner: 'from-gray-600 via-gray-500 to-gray-400',
  };

  const stats = [
    { label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—', icon: Shield },
    { label: 'Office', value: user?.office_location ?? '—', icon: Building2 },
    { label: 'Member since', value: '2026', icon: Calendar },
  ];

  return (
    <AppLayout title="Profile">
      <div className="space-y-6">

        {/* Hero banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6 p-7">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${roleTheme.accent} flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden shadow-lg`}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name ?? 'Avatar'} className="w-full h-full object-cover" />
              ) : initials}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.name ?? 'Your Profile'}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleTheme.badge}`}>
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {user?.email}
                </span>
                {user?.phone_number && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {user.phone_number}
                  </span>
                )}
                {user?.office_location && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {user.office_location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — identity stats */}
          <div className="space-y-4">
            {/* Account card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
              <div className="space-y-4">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-700 truncate capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avatar preview card */}
            {user?.avatar_url && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Avatar</h3>
                <img
                  src={user.avatar_url}
                  alt={user.name ?? 'Avatar'}
                  className="w-full aspect-square rounded-xl object-cover border border-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Right — edit forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 pt-6 pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Edit profile</h3>
                <p className="text-xs text-gray-400 mt-0.5">Changes are reflected immediately across the app.</p>
              </div>
              <div className="p-7">
                <ProfileForm />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 pt-6 pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Change password</h3>
                <p className="text-xs text-gray-400 mt-0.5">You will be signed out after a successful password change.</p>
              </div>
              <div className="p-7">
                <ChangePasswordForm />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 pt-6 pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Change email</h3>
                <p className="text-xs text-gray-400 mt-0.5">A confirmation link will be sent to your new address before the change takes effect.</p>
              </div>
              <div className="p-7">
                <ChangeEmailForm />
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
