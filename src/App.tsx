/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import AICamera from './pages/AICamera';
import Investor from './pages/Investor';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="map" element={<MapView />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="admin" element={<Admin />} />
              <Route path="camera" element={<AICamera />} />
              <Route path="investor" element={<Investor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}

