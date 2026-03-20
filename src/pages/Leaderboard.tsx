import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Crown, ShieldCheck, Camera, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Leaderboard() {
  const { user, pendingSBR } = useAppContext();

  // Mock leaderboard data
  const leaders = [
    { id: 'u2', name: 'Kidist T.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kidist', score: 1250, rank: 1 },
    { id: 'u3', name: 'Dawit M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dawit', score: 980, rank: 2 },
    { id: 'u4', name: 'Helen G.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helen', score: 850, rank: 3 },
    { id: user.id, name: user.name, avatar: user.avatar, score: user.isGuest ? pendingSBR : user.balance, rank: user.isGuest ? '-' : user.rank },
    { id: 'u5', name: 'Yonas K.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yonas', score: 120, rank: 5 },
  ];

  const badges = [
    { id: 'b1', name: 'First Scout', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-400/20', earned: !user.isGuest },
    { id: 'b2', name: 'First Submission', icon: MapPin, color: 'text-green-400', bg: 'bg-green-400/20', earned: user.submittedPlaces > 0 },
    { id: 'b3', name: 'Verified Place', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/20', earned: user.verifiedPlaces > 0 },
    { id: 'b4', name: 'Photo Pro', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/20', earned: user.completedTasks > 2 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-[var(--color-sbr-orange)]" /> Leaderboard
        </h1>
        <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
          This Week
        </div>
      </div>

      {user.isGuest && (
        <div className="bg-[var(--color-sbr-orange)]/10 border border-[var(--color-sbr-orange)]/30 p-4 rounded-xl text-center">
          <p className="text-sm text-[var(--color-sbr-orange)] font-bold mb-1">Guest Preview Mode</p>
          <p className="text-xs text-gray-300">Sign up to claim your rank and compete with others!</p>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mt-10 mb-8 h-48">
        {/* Rank 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <img src={leaders[1].avatar} alt={leaders[1].name} className="w-16 h-16 rounded-full border-4 border-gray-400 bg-gray-800" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">2</div>
          </div>
          <p className="mt-4 font-bold text-sm">{leaders[1].name}</p>
          <p className="text-[var(--color-sbr-orange)] font-bold text-xs">{leaders[1].score} SBR</p>
          <div className="w-20 h-24 bg-gradient-to-t from-gray-400/20 to-transparent mt-2 rounded-t-lg border-t-2 border-gray-400/50"></div>
        </motion.div>

        {/* Rank 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center z-10"
        >
          <Crown className="text-yellow-400 mb-1" size={24} />
          <div className="relative">
            <img src={leaders[0].avatar} alt={leaders[0].name} className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-gray-800 shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">1</div>
          </div>
          <p className="mt-4 font-bold">{leaders[0].name}</p>
          <p className="text-[var(--color-sbr-orange)] font-bold text-sm">{leaders[0].score} SBR</p>
          <div className="w-24 h-32 bg-gradient-to-t from-yellow-400/20 to-transparent mt-2 rounded-t-lg border-t-2 border-yellow-400/50"></div>
        </motion.div>

        {/* Rank 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <img src={leaders[2].avatar} alt={leaders[2].name} className="w-16 h-16 rounded-full border-4 border-amber-600 bg-gray-800" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">3</div>
          </div>
          <p className="mt-4 font-bold text-sm">{leaders[2].name}</p>
          <p className="text-[var(--color-sbr-orange)] font-bold text-xs">{leaders[2].score} SBR</p>
          <div className="w-20 h-20 bg-gradient-to-t from-amber-600/20 to-transparent mt-2 rounded-t-lg border-t-2 border-amber-600/50"></div>
        </motion.div>
      </div>

      {/* List */}
      <div className="space-y-3 mt-8">
        {leaders.slice(3).map((leader, i) => (
          <motion.div 
            key={leader.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className={`glass-panel p-4 rounded-xl flex items-center justify-between ${leader.id === user.id ? 'border-[var(--color-sbr-orange)]/50 bg-[var(--color-sbr-orange)]/5' : ''}`}
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-400 w-6 text-center">{leader.rank}</span>
              <img src={leader.avatar} alt={leader.name} className="w-10 h-10 rounded-full bg-gray-800" />
              <div>
                <h4 className="font-bold text-sm flex items-center gap-2">
                  {leader.name} 
                  {leader.id === user.id && <span className="text-[10px] bg-[var(--color-sbr-orange)] text-black px-2 py-0.5 rounded-full">You</span>}
                </h4>
              </div>
            </div>
            <div className="font-bold text-[var(--color-sbr-orange)] flex items-center gap-1">
              {leader.score} <span className="text-xs text-gray-400">SBR</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badges & Achievements */}
      <div className="mt-10 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Medal className="text-[var(--color-sbr-orange)]" /> Badges & Achievements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className={`glass-panel p-4 rounded-2xl flex flex-col items-center text-center gap-2 border ${badge.earned ? 'border-white/20' : 'border-white/5 opacity-50 grayscale'}`}
              >
                <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center ${badge.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">{badge.name}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{badge.earned ? 'Unlocked' : 'Locked'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
