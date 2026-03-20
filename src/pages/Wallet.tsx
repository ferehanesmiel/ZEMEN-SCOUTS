import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, Send, CreditCard, History, Coins } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Wallet() {
  const { user } = useAppContext();
  
  // Mock transactions
  const transactions = [
    { id: 'tx1', type: 'earn', amount: 15, title: 'Task: Verify Sugar Price', date: 'Today, 10:30 AM' },
    { id: 'tx2', type: 'spend', amount: -50, title: 'Runner Link Delivery', date: 'Yesterday, 2:15 PM' },
    { id: 'tx3', type: 'earn', amount: 30, title: 'Task: Hotel Front Photo', date: 'Mar 17, 9:00 AM' },
    { id: 'tx4', type: 'donate', amount: -10, title: 'Blooming Heart Donation', date: 'Mar 15, 4:45 PM' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SBR Wallet</h1>
        <div className="bg-white/10 p-2 rounded-full">
          <History size={20} className="text-gray-300" />
        </div>
      </div>

      {/* Main Balance Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[var(--color-sbr-orange)] to-orange-700 shadow-[0_10px_30px_rgba(255,106,0,0.3)]"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        {/* Floating Coins Animation */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-4 right-8 w-12 h-12 rounded-full bg-yellow-400/30 border border-yellow-400/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(250,204,21,0.5)]"
        >
          <span className="text-xl">🪙</span>
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-8 right-16 w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center backdrop-blur-md"
        >
          <span className="text-sm">🪙</span>
        </motion.div>

        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
          <div className="flex items-end gap-2 mb-6">
            <h2 className="text-5xl font-black text-white">{user.balance}</h2>
            <span className="text-xl font-bold text-white/90 mb-1">SBR</span>
          </div>
          
          <div className="flex items-center gap-2 text-white/80 text-sm bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span>≈ {(user.balance * 1.5).toFixed(2)} ETB</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={24} />
          </div>
          <span className="text-xs font-medium">Receive</span>
        </button>
        
        <button className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Send size={24} />
          </div>
          <span className="text-xs font-medium">Send</span>
        </button>
        
        <button className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <CreditCard size={24} />
          </div>
          <span className="text-xs font-medium">Pay</span>
        </button>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <History size={18} className="text-[var(--color-sbr-orange)]" />
          Recent Transactions
        </h3>
        
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'earn' ? 'bg-green-500/20 text-green-400' : 
                  tx.type === 'spend' ? 'bg-red-500/20 text-red-400' : 
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {tx.type === 'earn' ? <ArrowDownLeft size={20} /> : 
                   tx.type === 'spend' ? <ArrowUpRight size={20} /> : 
                   <Coins size={20} />}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{tx.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{tx.date}</p>
                </div>
              </div>
              <div className={`font-bold ${
                tx.type === 'earn' ? 'text-green-400' : 'text-white'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} SBR
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
