import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import MainLayout from './MainLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingCancelPage from './pages/BookingCancelPage';
import Dashboard from './Dashboard';
import Profile from './Profile';
import ServicesPage from './pages/ServicesPage';
import ServicesManagement from './pages/ServicesManagement';
import ProviderProfilePage from './pages/ProviderProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <Routes>
            {/* Public Layout Routes (Navbar + Footer) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/provider/services" element={
                <ProtectedRoute>
                  <ServicesManagement />
                </ProtectedRoute>
              } />
              <Route path="/provider/:userId" element={<ProviderProfilePage />} />
              <Route path="/booking/success" element={<BookingSuccessPage />} />
              <Route path="/booking/cancel" element={<BookingCancelPage />} />
            </Route>

            {/* Standalone Auth Routes (No Navbar) */}
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
          </Routes>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
