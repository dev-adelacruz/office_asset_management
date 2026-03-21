import { FC, useEffect } from 'react';
import { useAppDispatch } from './state/hooks';
import { checkAuthStatus } from './state/user/userSlice';
import AppRoutes from './routes';
import './assets/styles/tailwind.css';

export const App: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check authentication status when the app loads
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <div className="h-screen w-screen">
      <AppRoutes />
    </div>
  );
};
