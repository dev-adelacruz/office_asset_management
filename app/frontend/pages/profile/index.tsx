import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import ProfileForm from '../../components/profile/ProfileForm';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-xl font-bold shadow-lg shadow-blue-200 shrink-0">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name ?? 'Avatar'}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name ?? 'Your Profile'}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-8 space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Edit profile</h2>
          </div>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
