import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { updateProfile } from '../../state/user/userSlice';
import { User, Phone, MapPin, LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent ' +
  'transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400';

const labelClass = 'block text-xs font-medium text-gray-500 mb-1.5';

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  </div>
);

const ProfileForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isUpdatingProfile, profileError } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState(user?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '');
  const [officeLocation, setOfficeLocation] = useState(user?.office_location ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setPhoneNumber(user?.phone_number ?? '');
    setOfficeLocation(user?.office_location ?? '');
    setAvatarUrl(user?.avatar_url ?? '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    const result = await dispatch(updateProfile({
      name,
      phone_number: phoneNumber,
      office_location: officeLocation,
      avatar_url: avatarUrl,
    }));

    if (updateProfile.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Inline notifications */}
      {profileError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {profileError}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Profile saved successfully.
        </div>
      )}

      {/* Personal info */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal info</p>
        <Field label="Full name" icon={<User className="w-4 h-4" />}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            disabled={isUpdatingProfile}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Contact */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact & location</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone number" icon={<Phone className="w-4 h-4" />}>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 234 567 890"
              disabled={isUpdatingProfile}
              className={inputClass}
            />
          </Field>
          <Field label="Office location" icon={<MapPin className="w-4 h-4" />}>
            <input
              type="text"
              value={officeLocation}
              onChange={(e) => setOfficeLocation(e.target.value)}
              placeholder="e.g. Manila HQ"
              disabled={isUpdatingProfile}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Avatar */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Avatar</p>
        <Field label="Avatar URL" icon={<LinkIcon className="w-4 h-4" />}>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={isUpdatingProfile}
            className={inputClass}
          />
        </Field>
        {avatarUrl && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="w-8 h-8 rounded-lg object-cover border border-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-xs text-gray-400">Preview</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="relative flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all duration-150 shadow-md shadow-blue-200"
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
            'Save changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
