import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../state/store';
import { changePassword } from '../../state/user/userSlice';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent ' +
  'transition-all duration-150 disabled:opacity-50 placeholder:text-gray-400';

const labelClass = 'block text-xs font-medium text-gray-500 mb-1.5';

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Lock className="w-4 h-4" />
      </div>
      {children}
    </div>
  </div>
);

const ChangePasswordForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isChangingPassword, passwordError } = useSelector((state: RootState) => state.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const result = await dispatch(changePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: passwordConfirmation,
    }));

    if (changePassword.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {passwordError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {passwordError}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Password updated. Redirecting to sign in…
        </div>
      )}

      <Field label="Current password">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          disabled={isChangingPassword}
          required
          className={inputClass}
        />
      </Field>

      <Field label="New password">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={isChangingPassword}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Confirm new password">
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Repeat new password"
          disabled={isChangingPassword}
          required
          className={inputClass}
        />
      </Field>

      <div className="pt-1">
        <button
          type="submit"
          disabled={isChangingPassword}
          className="relative flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all duration-150 shadow-md shadow-blue-200"
        >
          {isChangingPassword ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Updating…
            </span>
          ) : (
            'Update password'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
