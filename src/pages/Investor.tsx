import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, MapPin, CheckCircle, PieChart, BarChart3, Globe, ArrowUpRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Investor() {
  const { stats } = useAppContext();

  const COLORS = ['#ff6a00', '#ffaa00', '#4ade80', '#3b82f6'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-6 pb-24"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Investor <span className="text-[var(--color-sbr-orange)]">Portal</span></h1>
          <p className="text-xs text-gray-400">Platform Growth & Impact Metrics</p>
        </div>
        <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Globe size={12} /> Live Data
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Total SBR Circulation</p>
          <div className="flex items-end gap-2">
            <h2 className="text-xl font-bold tracking-tight">{stats.sbrCirculation.toLocaleString()}</h2>
            <span className="text-[10px] text-green-400 flex items-center mb-1">
              <ArrowUpRight size={10} /> 12%
            </span>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Active Scouts</p>
          <div className="flex items-end gap-2">
            <h2 className="text-xl font-bold tracking-tight">{stats.activeUsers.toLocaleString()}</h2>
            <span className="text-[10px] text-green-400 flex items-center mb-1">
              <ArrowUpRight size={10} /> 8%
            </span>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--color-sbr-orange)]" />
            User Acquisition
          </h3>
          <select className="bg-black/40 border border-white/10 rounded-lg text-[10px] px-2 py-1 outline-none">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.userGrowth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#ff6a00' }}
              />
              <Area type="monotone" dataKey="count" stroke="#ff6a00" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-[var(--color-sbr-orange)]" />
            Category Distribution
          </h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryGrowth} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#ffffff60" fontSize={10} width={60} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {stats.categoryGrowth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Platform Health</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-xl font-bold">{stats.verifiedShops}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Verified POIs</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
            <BarChart3 size={20} className="text-blue-400" />
            <p className="text-xl font-bold">{stats.completedTasks.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tasks Fulfilled</p>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-[var(--color-sbr-orange)] to-orange-600 text-black">
        <h3 className="font-black text-xl mb-2 uppercase italic">Impact Summary</h3>
        <p className="text-sm font-medium opacity-90 leading-relaxed mb-4">
          ZEMEN SCOUTS is bridging the data gap in Ethiopia's emerging markets. 
          With over {stats.verifiedShops} verified locations, we provide real-time 
          insights for logistics, retail, and urban planning.
        </p>
        <button className="w-full bg-black text-white font-bold py-3 rounded-xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
          Download Full Report <ArrowUpRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
