import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/home';
import LoginPage from '../pages/login';
import ProfilePage from '../pages/profile';
import AssetsPage from '../pages/assets';
import LicensesPage from '../pages/licenses';
import RequestsPage from '../pages/requests';
import AuditLogsPage from '../pages/audit-logs';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={
          <ProtectedRoute>
            <HomePage/>
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <ProfilePage/>
          </ProtectedRoute>
        } />
        <Route path='/assets' element={
          <ProtectedRoute>
            <AssetsPage/>
          </ProtectedRoute>
        } />
        <Route path='/licenses' element={
          <ProtectedRoute>
            <LicensesPage/>
          </ProtectedRoute>
        } />
        <Route path='/requests' element={
          <ProtectedRoute>
            <RequestsPage/>
          </ProtectedRoute>
        } />
        <Route path='/audit-logs' element={
          <RoleProtectedRoute allowedRoles={['executive']}>
            <AuditLogsPage/>
          </RoleProtectedRoute>
        } />
        <Route path='/login' element={<LoginPage/>} />
      </Routes>
    </Router>
  )
}

export default AppRoutes;
