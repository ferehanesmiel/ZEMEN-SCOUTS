import React from 'react';
import { motion } from 'motion/react';
import { Users, CheckSquare, Coins, Store, Activity, TrendingUp } from 'lucide-react';

export default function Admin() {
  const stats = [
    { label: 'Active Users', value: '1,245', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Completed Tasks', value: '8,432', icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'SBR Circulation', value: '45,200', icon: Coins, color: 'text-[var(--color-sbr-orange)]', bg: 'bg-[var(--color-sbr-orange)]/10' },
    { label: 'Verified Shops', value: '342', icon: Store, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-[var(--color-sbr-orange)]" /> Admin Dashboard
        </h1>
        <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
          Demo Mode
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-4 rounded-2xl flex flex-col gap-3"
            >
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-panel p-5 rounded-2xl mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Platform Activity</h3>
          <TrendingUp className="text-gray-400" size={20} />
        </div>
        
        {/* Mock Chart */}
        <div className="h-40 flex items-end justify-between gap-2">
          {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-2">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
                className={`w-full rounded-t-md ${i === 6 ? 'bg-[var(--color-sbr-orange)]' : 'bg-white/10'}`}
              ></motion.div>
              <span className="text-[10px] text-gray-500">Day {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl">
        <h3 className="font-bold text-lg mb-4">Recent Verifications</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold">
                  U{item}
                </div>
                <div>
                  <p className="text-sm font-medium">Task #{1000 + item} verified</p>
                  <p className="text-xs text-gray-400">2 mins ago</p>
                </div>
              </div>
              <button className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium">
                Approve
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
