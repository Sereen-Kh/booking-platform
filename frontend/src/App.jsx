import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ServiceDetailPage from './pages/ServiceDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
            </Routes>
          </main>
          <footer className="border-t border-border py-12 bg-card transition-colors">
            <div className="container px-4 text-center text-muted-foreground text-sm">
              © 2025 BookIt Platform. All rights reserved. Built with FastAPI and React.
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
