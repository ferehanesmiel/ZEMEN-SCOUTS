import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, CheckCircle, MapPin, Clock, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Tasks() {
  const { tasks, completeTask } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('available');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.placeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">City Tasks</h1>
        <div className="bg-white/5 rounded-full p-1 flex">
          <button 
            onClick={() => setFilter('available')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'available' ? 'bg-[var(--color-sbr-orange)] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Available
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-[var(--color-sbr-orange)] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search tasks or locations..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-sbr-orange)]/50 transition-colors"
        />
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p>No tasks found matching your criteria.</p>
          </div>
        ) : (
          filteredTasks.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-panel p-5 rounded-2xl border ${task.status === 'completed' ? 'border-green-500/20' : 'border-white/5 hover:border-[var(--color-sbr-orange)]/30'} transition-all group`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sbr-orange)] bg-[var(--color-sbr-orange)]/10 px-2 py-1 rounded-md">
                    {task.type.replace('_', ' ')}
                  </span>
                  {task.isGuestPreview && (
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">
                      Guest Preview
                    </span>
                  )}
                  {task.isPremium && (
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400" /> Premium
                    </span>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-xs font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle size={12} /> Done
                    </span>
                  )}
                </div>
                <div className="font-bold text-lg text-[var(--color-sbr-orange)]">
                  +{task.reward} SBR
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{task.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{task.description}</p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin size={16} className="text-gray-500" />
                  {task.placeName}
                </div>
                
                {task.status === 'available' && (
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="bg-white/10 hover:bg-[var(--color-sbr-orange)] hover:text-black text-white px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                  >
                    Verify Now
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
