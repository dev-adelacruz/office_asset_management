import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { changeEmail } from '../../state/user/userSlice';
import { Mail, Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

const ChangeEmailForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isChangingEmail, emailError, emailPendingMessage } = useSelector((state: RootState) => state.user);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(changeEmail({ email: newEmail, current_password: currentPassword }));
  };

  if (emailPendingMessage || user?.pending_email) {
    return (
      <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Confirmation pending</p>
          <p className="mt-0.5 text-blue-600">
            A confirmation link was sent to <strong>{user?.pending_email}</strong>. Your email address will update once you click the link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {emailError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {emailError}
        </div>
      )}
      {emailPendingMessage && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {emailPendingMessage}
        </div>
      )}

      <Field label="New email address" icon={<Mail className="w-4 h-4" />}>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="new@example.com"
          disabled={isChangingEmail}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Current password (to confirm)" icon={<Lock className="w-4 h-4" />}>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter your current password"
          disabled={isChangingEmail}
          required
          className={inputClass}
        />
      </Field>

      <div className="pt-1">
        <button
          type="submit"
          disabled={isChangingEmail}
          className="relative flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all duration-150 shadow-md shadow-blue-200"
        >
          {isChangingEmail ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending…
            </span>
          ) : (
            'Send confirmation email'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangeEmailForm;
