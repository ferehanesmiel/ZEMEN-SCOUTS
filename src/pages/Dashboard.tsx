import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, MapPin, CheckCircle, TrendingUp, Clock, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, tasks } = useAppContext();
  
  const availableTasks = tasks.filter(t => t.status === 'available');
  const recentTasks = tasks.filter(t => t.status === 'completed').slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-gray-400 text-sm font-medium">Welcome back,</h2>
          <h1 className="text-2xl font-bold">{user.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Current Rank</p>
          <p className="text-lg font-bold text-[var(--color-sbr-orange)]">#{user.rank} Scout</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-panel p-4 rounded-2xl flex flex-col gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-[var(--color-sbr-orange)]">
            <TrendingUp size={18} />
          </div>
          <p className="text-2xl font-bold">{user.balance}</p>
          <p className="text-xs text-gray-400">Total SBR Earned</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-panel p-4 rounded-2xl flex flex-col gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <CheckCircle size={18} />
          </div>
          <p className="text-2xl font-bold">{user.completedTasks}</p>
          <p className="text-xs text-gray-400">Tasks Completed</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Premium Places</h3>
        </div>
        
        <div className="space-y-3 mb-6">
          {tasks.filter(t => t.isPremium).map((task, i) => (
            <motion.div 
              key={`premium-${task.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-4 rounded-xl flex items-center justify-between group cursor-pointer border border-yellow-400/30 bg-yellow-400/5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 mt-1">
                  <Star size={18} className="fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-yellow-400">{task.placeName}</h4>
                  <p className="text-xs text-gray-400 mt-1">{task.title}</p>
                </div>
              </div>
              <Link to="/map" className="text-xs bg-yellow-400 text-black font-semibold px-3 py-1 rounded-full">
                Visit
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Nearby Tasks</h3>
          <Link to="/tasks" className="text-sm text-[var(--color-sbr-orange)] flex items-center">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="space-y-3">
          {availableTasks.slice(0, 3).map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-[var(--color-sbr-orange)]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mt-1">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{task.placeName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-300">
                      {task.type.replace('_', ' ')}
                    </span>
                    {task.isGuestPreview && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                        Guest Preview
                      </span>
                    )}
                    {task.isPremium && (
                      <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400" /> Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-[var(--color-sbr-orange)]">+{task.reward} SBR</span>
                <Link to="/map" className="text-xs bg-[var(--color-sbr-orange)] text-black font-semibold px-3 py-1 rounded-full">
                  Start
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentTasks.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="glass-panel rounded-xl overflow-hidden">
            {recentTasks.map((task, i) => (
              <div key={task.id} className={`p-4 flex items-center justify-between ${i !== recentTasks.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> Just now
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400">+{task.reward}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
