import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Map, CheckSquare, Wallet, Trophy, ShieldAlert, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/camera', icon: Camera, label: 'AI Cam' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/leaderboard', icon: Trophy, label: 'Rank' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 h-full relative ${
                isActive ? 'text-[var(--color-sbr-orange)]' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 w-8 h-1 bg-[var(--color-sbr-orange)] rounded-b-full shadow-[0_0_10px_var(--color-sbr-orange)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon size={20} className={isActive ? 'mb-1' : 'mb-1'} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

const Header = () => {
  const { user } = useAppContext();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-panel z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-sbr-orange)] to-yellow-400 flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(255,106,0,0.5)]">
          Z
        </div>
        <h1 className="font-bold text-lg tracking-tight">ZEMEN <span className="text-[var(--color-sbr-orange)]">SCOUTS</span></h1>
      </div>
      
      <div className="flex items-center gap-3">
        <NavLink to="/admin" className="text-gray-400 hover:text-white">
          <ShieldAlert size={20} />
        </NavLink>
        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
          <span className="text-sm font-bold text-[var(--color-sbr-orange)]">{user.balance} SBR</span>
          <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-gray-800" />
        </div>
      </div>
    </header>
  );
};

const Notifications = () => {
  const { notifications } = useAppContext();

  return (
    <div className="fixed top-20 left-0 right-0 z-50 flex flex-col items-center pointer-events-none gap-2 px-4">
      <AnimatePresence>
        {notifications.map((note, idx) => (
          <motion.div
            key={`${note}-${idx}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-gradient-to-r from-[var(--color-sbr-orange)] to-orange-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2"
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs">🪙</span>
            {note}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen bg-[var(--color-sbr-dark)] text-white pb-16 pt-16">
      <Header />
      <Notifications />
      <main className="h-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
