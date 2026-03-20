import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, CheckSquare, Wallet, Trophy, ShieldAlert, Camera, Bell, Flame, X, BarChart3, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

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
  const { user: appUser, pushNotifications } = useAppContext();
  const { user: authUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const navigate = useNavigate();
  
  const unreadCount = pushNotifications.length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 glass-panel z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-sbr-orange)] to-yellow-400 flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(255,106,0,0.5)]">
            Z
          </div>
          <h1 className="font-bold text-lg tracking-tight">ZEMEN <span className="text-[var(--color-sbr-orange)]">SCOUTS</span></h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {appUser.streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30 text-orange-400">
              <Flame size={14} fill="currentColor" />
              <span className="text-xs font-bold">{appUser.streak}</span>
            </div>
          )}
          
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--color-sbr-dark)]">
                {unreadCount}
              </span>
            )}
          </button>

          <NavLink to="/investor" className="text-gray-400 hover:text-white p-2">
            <BarChart3 size={20} />
          </NavLink>

          <NavLink to="/admin" className="text-gray-400 hover:text-white p-2">
            <ShieldAlert size={20} />
          </NavLink>

          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
            <span className="text-sm font-bold text-[var(--color-sbr-orange)]">{appUser.balance} SBR</span>
            <div className="flex items-center gap-2">
              <img src={authUser?.photoURL || appUser.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-gray-800" />
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-[var(--color-sbr-dark)] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-bottom border-white/10 flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Bell size={20} className="text-[var(--color-sbr-orange)]" />
                  Notifications
                </h2>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {pushNotifications.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  pushNotifications.map((notif) => (
                    <div key={notif.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          notif.type === 'reward' ? 'bg-green-500/20 text-green-400' :
                          notif.type === 'task' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm mb-1">{notif.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
