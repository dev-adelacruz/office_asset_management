import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/home';
import LoginPage from '../pages/login';
import ProfilePage from '../pages/profile';
import ProtectedRoute from '../components/ProtectedRoute';

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
        <Route path='/login' element={<LoginPage/>} />
      </Routes>
    </Router>
  )
}

export default AppRoutes;
