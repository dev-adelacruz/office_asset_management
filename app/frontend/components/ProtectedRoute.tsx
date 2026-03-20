import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isSignedIn = useSelector((state: RootState) => state.user.isSignedIn);
  const isLoading = useSelector((state: RootState) => state.user.isLoading);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Mark that auth check has completed when loading finishes
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only redirect if auth check has completed and user is not signed in
  if (authChecked && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Don't render anything until auth check is complete
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
