import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Redirect to home or dashboard after successful login
    navigate('/');
  };

  const handleLoginError = (error: string) => {
    // TODO: Display error message to user
    console.error('Login error:', error);
    alert(`Login failed: ${error}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-4">
        <LoginForm
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      </div>
    </div>
  );
};

export default LoginPage;
