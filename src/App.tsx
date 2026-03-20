/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import AICamera from './pages/AICamera';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapView />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="admin" element={<Admin />} />
            <Route path="camera" element={<AICamera />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

