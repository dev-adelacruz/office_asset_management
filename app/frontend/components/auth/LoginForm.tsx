import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state/store';
import { loginUser, clearError } from '../../state/user/userSlice';
import { tokenStorage } from '../../services/tokenStorage';
import { Mail, Lock, LogIn, Zap } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (error) {
      onError(error);
      dispatch(clearError());
    }
  }, [error, onError, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      // Store token based on remember me preference
      await tokenStorage.storeToken(result.payload.token, {
        encrypt: true,
        storageType: rememberMe ? 'local' : 'session'
      });
      onSuccess();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="p-10 space-y-8">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mb-1">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute w-4.5 h-4.5 text-gray-400 top-3.5 left-3.5" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50"
            />
          </div>
          <div className="relative">
            <Lock className="absolute w-4.5 h-4.5 text-gray-400 top-3.5 left-3.5" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-150 disabled:opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-150 shadow-md shadow-blue-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
