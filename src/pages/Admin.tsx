import React from 'react';
import { motion } from 'motion/react';
import { Users, CheckSquare, Coins, Store, Activity, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Admin() {
  const { contributions, approveContribution, rejectContribution, requestEditContribution, verifications, approveVerification, rejectVerification, stats: dynamicStats } = useAppContext();
  
  const pendingContributions = contributions.filter(c => c.status === 'pending');
  const pendingVerifications = verifications.filter(v => v.status === 'pending');

  const stats = [
    { label: 'Active Users', value: dynamicStats.activeUsers.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Completed Tasks', value: dynamicStats.completedTasks.toLocaleString(), icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'SBR Circulation', value: dynamicStats.sbrCirculation.toLocaleString(), icon: Coins, color: 'text-[var(--color-sbr-orange)]', bg: 'bg-[var(--color-sbr-orange)]/10' },
    { label: 'Verified Shops', value: dynamicStats.verifiedShops.toLocaleString(), icon: Store, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Pending Contributions</h3>
          <span className="bg-[var(--color-sbr-orange)] text-black text-xs font-bold px-2 py-1 rounded-full">{pendingContributions.length}</span>
        </div>
        
        <div className="space-y-4">
          {pendingContributions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No pending contributions.</p>
          ) : (
            pendingContributions.map((contrib) => (
              <div key={contrib.id} className="border border-white/10 p-4 rounded-xl bg-black/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm">{contrib.name}</h4>
                    <p className="text-xs text-[var(--color-sbr-orange)]">{contrib.category}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(contrib.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-300 mb-1"><span className="text-gray-500">Address:</span> {contrib.address}</p>
                {contrib.notes && <p className="text-xs text-gray-300 mb-1"><span className="text-gray-500">Notes:</span> {contrib.notes}</p>}
                {contrib.products && <p className="text-xs text-gray-300 mb-1"><span className="text-gray-500">Products/Services:</span> {contrib.products}</p>}
                {contrib.openingHours && <p className="text-xs text-gray-300 mb-3"><span className="text-gray-500">Opening Hours:</span> {contrib.openingHours}</p>}
                
                {contrib.photoUrls && contrib.photoUrls.length > 0 && (
                  <div className="mt-2 mb-4 grid grid-cols-3 gap-2">
                    {contrib.photoUrls.map((url, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-white/10 aspect-square">
                        <img src={url} alt={`Contribution ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => approveContribution(contrib.id)}
                      className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle size={14} /> Approve (+{contrib.reward} SBR)
                    </button>
                    <button 
                      onClick={() => rejectContribution(contrib.id)}
                      className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const reason = prompt('Reason for edit request:');
                      if (reason) requestEditContribution(contrib.id, reason);
                    }}
                    className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Activity size={14} /> Request Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Pending Verifications</h3>
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingVerifications.length}</span>
        </div>
        
        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No pending verifications.</p>
          ) : (
            pendingVerifications.map((v) => (
              <div key={v.id} className="border border-white/10 p-4 rounded-xl bg-black/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm">{v.placeName}</h4>
                    <p className="text-xs text-blue-400">Verification Submission</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(v.date).toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  <p className="text-[10px] text-gray-300"><span className="text-gray-500">Price:</span> {v.price || 'N/A'}</p>
                  <p className="text-[10px] text-gray-300"><span className="text-gray-500">Availability:</span> {v.availability}</p>
                  <p className="text-[10px] text-gray-300"><span className="text-gray-500">Stock:</span> {v.stockQuantity || 'N/A'}</p>
                  <p className="text-[10px] text-gray-300"><span className="text-gray-500">Hours:</span> {v.openingHours || 'N/A'}</p>
                </div>

                {v.notes && <p className="text-[10px] text-gray-300 mt-2"><span className="text-gray-500">Notes:</span> {v.notes}</p>}
                
                {v.photoUrls && v.photoUrls.length > 0 && (
                  <div className="mt-3 mb-4 grid grid-cols-3 gap-2">
                    {v.photoUrls.map((url, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-white/10 aspect-square">
                        <img src={url} alt={`Verification ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => approveVerification(v.id)}
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle size={14} /> Approve (+{v.reward} SBR)
                  </button>
                  <button 
                    onClick={() => rejectVerification(v.id)}
                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
    </motion.div>
  );
}
