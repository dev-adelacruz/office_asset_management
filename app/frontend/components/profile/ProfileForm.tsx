import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { updateProfile } from '../../state/user/userSlice';
import { User, Phone, MapPin, Image, Save } from 'lucide-react';

const ProfileForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isUpdatingProfile, profileError } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState(user?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '');
  const [officeLocation, setOfficeLocation] = useState(user?.office_location ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setPhoneNumber(user?.phone_number ?? '');
    setOfficeLocation(user?.office_location ?? '');
    setAvatarUrl(user?.avatar_url ?? '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    const result = await dispatch(updateProfile({
      name,
      phone_number: phoneNumber,
      office_location: officeLocation,
      avatar_url: avatarUrl,
    }));

    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage('Profile updated successfully.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {profileError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {profileError}
        </div>
      )}
      {successMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="relative">
        <User className="absolute w-4 h-4 text-gray-400 top-3.5 left-3.5" />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          disabled={isUpdatingProfile}
          className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50"
        />
      </div>

      <div className="relative">
        <Phone className="absolute w-4 h-4 text-gray-400 top-3.5 left-3.5" />
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone number"
          disabled={isUpdatingProfile}
          className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50"
        />
      </div>

      <div className="relative">
        <MapPin className="absolute w-4 h-4 text-gray-400 top-3.5 left-3.5" />
        <input
          type="text"
          value={officeLocation}
          onChange={(e) => setOfficeLocation(e.target.value)}
          placeholder="Office location"
          disabled={isUpdatingProfile}
          className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50"
        />
      </div>

      <div className="relative">
        <Image className="absolute w-4 h-4 text-gray-400 top-3.5 left-3.5" />
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Avatar URL"
          disabled={isUpdatingProfile}
          className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isUpdatingProfile}
        className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-150 shadow-md shadow-blue-200"
      >
        {isUpdatingProfile ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving…
          </span>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save changes
          </>
        )}
      </button>
    </form>
  );
};

export default ProfileForm;
