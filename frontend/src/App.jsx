import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
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
          <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />

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
              </Routes>
            </main>
            <footer className="border-t border-border py-12 bg-card transition-colors">
              <div className="container px-4 text-center text-muted-foreground text-sm">
                © 2025 BookIt Platform. All rights reserved. Built with FastAPI and React.
              </div>
            </footer>
          </div>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
