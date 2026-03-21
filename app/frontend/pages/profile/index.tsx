import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import ProfileForm from '../../components/profile/ProfileForm';
import AppLayout from '../../components/layout/AppLayout';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const roleColor: Record<string, string> = {
    executive: 'bg-amber-100 text-amber-700 border-amber-200',
    manager:   'bg-indigo-100 text-indigo-700 border-indigo-200',
    employee:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const roleBadge = roleColor[user?.role ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <AppLayout title="Profile">
      <div className="max-w-2xl space-y-6">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
          </div>

          {/* Avatar + identity */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name ?? 'Avatar'} className="w-full h-full object-cover" />
                ) : initials}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.name ?? 'Your Profile'}</h2>
                <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleBadge}`}>
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{user?.email}</span>
              </div>
              {user?.phone_number && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{user.phone_number}</span>
                </div>
              )}
              {user?.office_location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{user.office_location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-1 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Edit profile</h3>
            <p className="text-xs text-gray-400 mt-0.5">Updates are reflected immediately across the app.</p>
          </div>
          <div className="p-6">
            <ProfileForm />
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default ProfilePage;
