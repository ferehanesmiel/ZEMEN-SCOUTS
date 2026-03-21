import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckSquare, Coins, Store, Activity, TrendingUp, 
  CheckCircle, XCircle, Map as MapIcon, BarChart3, Trophy, 
  Bell, Search, Filter, Download, UserPlus, Shield, 
  ShieldAlert, MoreVertical, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, LayoutDashboard, Settings, LogOut,
  Menu, X, ChevronRight, MapPin, Navigation, Globe, Plus
} from 'lucide-react';
import { useAppContext, User, Transaction, Contribution, Verification, Place, Product } from '../context/AppContext';
import { AdminTaskForm } from '../components/AdminTaskForm';
import { AdminVerificationTable } from '../components/AdminVerificationTable';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

type DashboardTab = 'overview' | 'users' | 'places' | 'tasks' | 'wallet' | 'map' | 'analytics' | 'gamification' | 'investor';

export default function Admin() {
  const { 
    user,
    users, contributions, verifications, transactions, places,
    approveContribution, rejectContribution, requestEditContribution,
    approveVerification, rejectVerification,
    updateUserStatus, deleteUser, mergeGuestWallet, adjustUserBalance,
    updateContributionLocation, deleteContribution, broadcastNotification,
    verifyPlace, updatePlaceProducts, updatePlaceLocation, deletePlace,
    stats: dynamicStats 
  } = useAppContext();

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSort, setUserSort] = useState<'name' | 'balance' | 'rank'>('name');
  const [placeFilter, setPlaceFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [walletSort, setWalletSort] = useState<'date' | 'amount'>('date');
  const [mapMode, setMapMode] = useState<'pins' | 'heatmap'>('pins');

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    let result = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (userSort === 'name') return a.name.localeCompare(b.name);
      if (userSort === 'balance') return b.balance - a.balance;
      if (userSort === 'rank') return a.rank - b.rank;
      return 0;
    });

    return result;
  }, [users, searchTerm, userSort]);

  const filteredPlaces = useMemo(() => 
    places.filter(p => placeFilter === 'all' || (placeFilter === 'pending' ? !p.verified : p.verified)),
    [places, placeFilter]
  );

  const filteredVerifications = useMemo(() => 
    verifications.filter(v => taskFilter === 'all' || v.status === taskFilter),
    [verifications, taskFilter]
  );

  const sortedTransactions = useMemo(() => {
    let result = [...transactions];
    if (walletSort === 'date') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      result.sort((a, b) => b.amount - a.amount);
    }
    return result;
  }, [transactions, walletSort]);

  const pendingContributions = contributions.filter(c => c.status === 'pending');
  const pendingVerifications = verifications.filter(v => v.status === 'pending');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'places', label: 'Places & Contributions', icon: Store },
    { id: 'tasks', label: 'Tasks & Verifications', icon: CheckSquare },
    { id: 'wallet', label: 'Wallet & Transactions', icon: Coins },
    { id: 'map', label: 'Map Management', icon: MapIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'gamification', label: 'Gamification', icon: Trophy },
    { id: 'investor', label: 'Investor Portal', icon: Globe },
  ];

  const chartData = useMemo(() => 
    dynamicStats.dailyActivity.map((val, i) => ({ name: `Day ${i + 1}`, value: val })),
    [dynamicStats.dailyActivity]
  );

  const pieData = [
    { name: 'Shops', value: 400 },
    { name: 'Cafes', value: 300 },
    { name: 'Services', value: 200 },
    { name: 'Others', value: 100 },
  ];

  const COLORS = ['#ff6a00', '#3b82f6', '#10b981', '#8b5cf6'];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: dynamicStats.activeUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Completed Tasks', value: dynamicStats.completedTasks, icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'SBR Circulation', value: dynamicStats.sbrCirculation, icon: Coins, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Verified Places', value: dynamicStats.verifiedShops, icon: Store, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-400" /> Platform Activity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6a00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#ff6a00' }}
                />
                <Area type="monotone" dataKey="value" stroke="#ff6a00" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" /> Category Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Recent Transactions</h3>
            <button onClick={() => setActiveTab('wallet')} className="text-xs text-orange-400 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earn' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type === 'earn' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.userName}</p>
                    <p className="text-[10px] text-gray-500">{tx.description}</p>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Pending Approvals</h3>
            <div className="flex gap-2">
              <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/30">{pendingContributions.length} Places</span>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30">{pendingVerifications.length} Tasks</span>
            </div>
          </div>
          <div className="space-y-4">
            {pendingContributions.slice(0, 3).map(c => (
              <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-[10px] text-gray-500">{c.category} • {new Date(c.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setActiveTab('places')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
            {pendingVerifications.slice(0, 2).map(v => (
              <div key={v.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{v.placeName}</p>
                  <p className="text-[10px] text-gray-500">Verification • {new Date(v.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setActiveTab('tasks')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={userSort}
            onChange={(e) => setUserSort(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="name">Sort by Name</option>
            <option value="balance">Sort by Balance</option>
            <option value="rank">Sort by Rank</option>
          </select>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600">
            <UserPlus size={16} /> Add Scout
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stats</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Wallet</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-gray-800" />
                    <div>
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-[10px] text-gray-500">Joined {new Date(u.dateJoined).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-xs text-gray-300">{u.email}</p>
                  <p className="text-[10px] text-gray-500">{u.phone}</p>
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <div className="text-center">
                      <p className="text-xs font-bold">{u.completedTasks}</p>
                      <p className="text-[8px] text-gray-500 uppercase">Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold">{u.submittedPlaces}</p>
                      <p className="text-[8px] text-gray-500 uppercase">Places</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold text-orange-400">{u.balance} SBR</p>
                  <p className="text-[10px] text-gray-500">Rank #{u.rank}</p>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${u.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => {
                        const amount = prompt(`Adjust balance for ${u.name} (e.g. 50 or -20):`);
                        if (amount) adjustUserBalance(u.id, parseInt(amount), 'Admin manual adjustment');
                      }}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-orange-400"
                      title="Adjust Balance"
                    >
                      <Coins size={16} />
                    </button>
                    <button 
                      onClick={() => updateUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                      className={`p-2 bg-white/5 rounded-lg hover:bg-white/10 ${u.status === 'active' ? 'text-red-400' : 'text-green-400'}`}
                      title={u.status === 'active' ? 'Suspend' : 'Activate'}
                    >
                      {u.status === 'active' ? <ShieldAlert size={16} /> : <Shield size={16} />}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${u.name}?`)) deleteUser(u.id);
                      }}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-red-500"
                      title="Delete User"
                    >
                      <XCircle size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const targetId = prompt('Enter target User ID to merge into:');
                        if (targetId) mergeGuestWallet(u.id, targetId);
                      }}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-blue-400"
                      title="Merge Guest Wallet"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Shared Map Places</h3>
        <div className="flex gap-2">
          {(['all', 'pending', 'verified'] as const).map(status => (
            <button 
              key={status}
              onClick={() => setPlaceFilter(status as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                placeFilter === status ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlaces.map(p => (
          <div key={p.id} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Store size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{p.name}</h4>
                  <p className="text-xs text-gray-400">{p.category} • {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.verified ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                  {p.verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-xs text-gray-300">
                <MapPin size={14} className="text-gray-500 mt-0.5 shrink-0" />
                <span>{p.address}</span>
              </div>
              {p.products && p.products.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.products.map((prod, i) => (
                    <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">
                      {prod.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {p.photos && p.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {p.photos.map((url, i) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-square border border-white/10">
                    <img src={url} alt="Place" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {!p.verified && (
                <button 
                  onClick={() => verifyPlace(p.id)}
                  className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle size={16} /> Verify & Go Live
                </button>
              )}
              <button 
                onClick={() => {
                  const name = prompt('New product name:');
                  if (name) {
                    const newProducts = [...p.products, { name, price: 0, last_updated: new Date().toISOString() }];
                    updatePlaceProducts(p.id, newProducts);
                  }
                }}
                className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} /> Add Product
              </button>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to remove this place?')) {
                    // deletePlace logic could go here
                  }
                }}
                className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center hover:bg-red-500/20 text-red-400"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredPlaces.length === 0 && (
          <div className="col-span-full py-20 text-center glass-panel rounded-2xl">
            <Store size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No places found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Task Verifications</h3>
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map(status => (
            <button 
              key={status}
              onClick={() => setTaskFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                taskFilter === status ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredVerifications.map(v => (
          <div key={v.id} className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{v.placeName}</h4>
                  <p className="text-[10px] text-gray-500">Submitted by {v.submittedBy} • {new Date(v.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Price Reported</p>
                  <p className="text-sm font-bold text-green-400">{v.price || 'N/A'}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Availability</p>
                  <p className={`text-sm font-bold ${v.availability === 'Available' ? 'text-green-400' : 'text-red-400'}`}>{v.availability}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Stock</p>
                  <p className="text-sm font-bold">{v.stockQuantity || 'N/A'}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Hours</p>
                  <p className="text-sm font-bold">{v.openingHours || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3">
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Photo Proof</p>
              <div className="grid grid-cols-2 gap-2">
                {v.photoUrls && v.photoUrls.length > 0 ? (
                  v.photoUrls.map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-video border border-white/10">
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10">
                    <p className="text-xs text-gray-500">No photos submitted</p>
                  </div>
                )}
              </div>
              {v.notes && (
                <div className="mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Scout Notes</p>
                  <p className="text-xs text-gray-300 italic">"{v.notes}"</p>
                </div>
              )}
            </div>

            <div className="lg:w-1/3 flex flex-col justify-between">
              <div className="text-right">
                <p className="text-xs font-bold text-orange-400">Reward: +{v.reward} SBR</p>
                <p className="text-[10px] text-gray-500">Verification Bonus</p>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => approveVerification(v.id)}
                  className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Approve Verification
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => rejectVerification(v.id)}
                    className="flex-1 bg-red-500/20 text-red-400 font-bold py-2.5 rounded-xl hover:bg-red-500/30 transition-colors text-xs"
                  >
                    Reject
                  </button>
                  <button className="flex-1 bg-white/5 text-gray-400 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors text-xs">
                    Request Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {pendingVerifications.length === 0 && (
          <div className="py-20 text-center glass-panel rounded-2xl">
            <CheckSquare size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">All verifications are up to date.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/30">
          <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-2">Total SBR in Circulation</p>
          <h2 className="text-4xl font-bold">{dynamicStats.sbrCirculation.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
            <TrendingUp size={14} /> <span>+12% from last month</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Total Transactions (24h)</p>
          <h2 className="text-4xl font-bold">1,284</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-blue-400">
            <Activity size={14} /> <span>Active economy</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Avg. Reward per Task</p>
          <h2 className="text-4xl font-bold">12.5</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Coins size={14} /> <span>Stable distribution</span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold">Transaction History</h3>
          <div className="flex items-center gap-4">
            <select 
              value={walletSort}
              onChange={(e) => setWalletSort(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-1.5 outline-none focus:border-orange-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
            <button 
              onClick={() => {
                const headers = ['ID', 'User', 'Type', 'Amount', 'Description', 'Date'];
                const rows = sortedTransactions.map(tx => [tx.id, tx.userName, tx.type, tx.amount, tx.description, tx.date]);
                const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `zemen_transactions_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-xs flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-xs font-bold text-gray-400 uppercase">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-xs font-mono text-gray-500">{tx.id}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{tx.userName}</p>
                    <p className="text-[10px] text-gray-500">{tx.userId}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      tx.type === 'earn' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                      tx.type === 'spend' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className={`font-bold ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount} SBR
                    </p>
                  </td>
                  <td className="p-4 text-xs text-gray-300">{tx.description}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">City Map Management</h3>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setMapMode('pins')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mapMode === 'pins' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Pins
          </button>
          <button 
            onClick={() => setMapMode('heatmap')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mapMode === 'heatmap' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Heatmap
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] rounded-2xl overflow-hidden border border-white/10 relative">
        <MapContainer 
          center={[9.0227, 38.7460]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {mapMode === 'pins' ? (
            places.map(p => (
              <Marker 
                key={p.id} 
                position={[p.location.lat, p.location.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    updatePlaceLocation(p.id, { lat: position.lat, lng: position.lng });
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <h4 className="font-bold text-sm">{p.name}</h4>
                    <p className="text-xs text-gray-500">{p.category}</p>
                    <p className="text-[10px] mt-1">{p.address}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${p.verified ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {p.verified ? 'Verified' : 'Pending'}
                      </span>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this pin?')) deletePlace(p.id);
                        }}
                        className="text-[8px] text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          ) : (
            // Simulated Heatmap using semi-transparent circles
            places.map(p => (
              <Circle 
                key={`heat-${p.id}`}
                center={[p.location.lat, p.location.lng]}
                radius={500}
                pathOptions={{
                  fillColor: p.verified ? '#10b981' : '#ff6a00',
                  fillOpacity: 0.2,
                  stroke: false
                }}
              />
            ))
          )}
        </MapContainer>
        
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-[1000] pointer-events-none">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 pointer-events-auto backdrop-blur-md">
            <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Map Stats</h4>
            <div className="flex gap-6">
              <div>
                <p className="text-xl font-bold">{places.length}</p>
                <p className="text-[10px] text-gray-500 uppercase">Total Pins</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-500">{places.filter(p => !p.verified).length}</p>
                <p className="text-[10px] text-gray-500 uppercase">Pending</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-500">{places.filter(p => p.verified).length}</p>
                <p className="text-[10px] text-gray-500 uppercase">Verified</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button className="w-12 h-12 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center hover:scale-110 transition-transform">
              <Navigation size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="font-bold mb-6">User Growth Over Time</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicStats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#ff6a00" strokeWidth={3} dot={{ fill: '#ff6a00', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold mb-6">Contribution Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicStats.categoryGrowth}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dynamicStats.categoryGrowth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Session Time', value: '12m 45s', change: '+5%', trend: 'up' },
          { label: 'Retention Rate', value: '68%', change: '+2%', trend: 'up' },
          { label: 'Bounce Rate', value: '24%', change: '-3%', trend: 'down' },
          { label: 'Conversion', value: '4.2%', change: '+0.5%', trend: 'up' },
        ].map((metric) => (
          <div key={metric.label} className="glass-panel p-5 rounded-2xl">
            <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{metric.value}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${metric.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGamification = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Gamification & Rewards</h3>
        <button 
          onClick={() => {
            const name = prompt('Badge Name:');
            const icon = prompt('Badge Icon (Emoji):');
            if (name && icon) {
              alert(`Badge "${name}" created successfully!`);
              // In a real app, we would update the state/backend
            }
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600"
        >
          Create New Badge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" /> Active Badges
          </h4>
          <div className="space-y-4">
            {[
              { name: 'Top Scout', icon: '🏆', users: 12, color: 'bg-yellow-400/10' },
              { name: 'Verified Pioneer', icon: '🛡️', users: 45, color: 'bg-blue-400/10' },
              { name: 'Market Expert', icon: '🏪', users: 89, color: 'bg-green-400/10' },
              { name: 'Active Contributor', icon: '✍️', users: 156, color: 'bg-purple-400/10' },
            ].map(badge => (
              <div key={badge.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${badge.color} flex items-center justify-center text-xl`}>
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{badge.name}</p>
                    <p className="text-[10px] text-gray-500">{badge.users} users earned</p>
                  </div>
                </div>
                <button className="text-xs text-gray-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-6 rounded-2xl">
          <h4 className="font-bold mb-4">Leaderboard Management</h4>
          <div className="space-y-4">
            {users.sort((a, b) => b.balance - a.balance).slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-gray-800" />
                  <div>
                    <p className="text-sm font-bold">{u.name}</p>
                    <div className="flex gap-1 mt-1">
                      {u.badges?.map(b => (
                        <span key={b} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-400">{u.balance} SBR</p>
                  <p className="text-[10px] text-gray-500">{u.completedTasks} tasks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvestor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Valuation', value: '$2.4M', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Burn Rate', value: '$12K/mo', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'SBR Market Cap', value: '1.2M SBR', icon: Coins, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'User Acquisition', value: '+18%', icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold mb-6">Revenue Projections</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicStats.userGrowth.map(d => ({ ...d, revenue: d.count * 0.5 }))}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold mb-6">Market Expansion</h3>
          <div className="space-y-4">
            {[
              { city: 'Addis Ababa', progress: 85, color: 'bg-orange-500' },
              { city: 'Dire Dawa', progress: 45, color: 'bg-blue-500' },
              { city: 'Adama', progress: 30, color: 'bg-green-500' },
              { city: 'Bahir Dar', progress: 15, color: 'bg-purple-500' },
            ].map(city => (
              <div key={city.city}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{city.city}</span>
                  <span className="text-gray-400">{city.progress}% Coverage</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${city.progress}%` }}
                    className={`h-full ${city.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent">
        <h3 className="font-bold mb-4">Investor Announcements</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-sm font-bold">Series A Funding Round Open</p>
            <p className="text-xs text-gray-400 mt-1">We are looking for strategic partners to scale ZEMEN across East Africa.</p>
            <button className="mt-3 text-xs text-blue-400 font-bold hover:underline">Download Pitch Deck</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'places': return renderPlaces();
      case 'tasks': return renderTasks();
      case 'wallet': return renderWallet();
      case 'map': return renderMap();
      case 'analytics': return renderAnalytics();
      case 'gamification': return renderGamification();
      case 'investor': return renderInvestor();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0f1a] text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-[#0e1424] border-r border-white/5 flex flex-col shrink-0 relative z-50"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,106,0,0.4)]">
            <Shield size={24} className="text-white" />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-black text-lg tracking-tighter leading-none">ZEMEN</h1>
              <p className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">Admin Console</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as DashboardTab)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(255,106,0,0.2)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-orange-400'} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {activeTab === item.id && isSidebarOpen && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_#fff]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">Collapse Sidebar</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-2">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0f1a]">
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#0b0f1a]/80 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h2 className="text-xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-xs text-gray-500">Welcome back, Administrator</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="flex flex-col items-end">
                <p className="text-[10px] text-gray-500 uppercase font-bold">System Status</p>
                <div className="text-xs text-green-400 font-bold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> Operational
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const msg = prompt('Enter broadcast message for all users:');
                  if (msg) broadcastNotification(msg);
                }}
                className="hidden md:flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all"
              >
                <Bell size={16} /> Broadcast
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#0b0f1a]"></span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-[1px]">
                <div className="w-full h-full rounded-[11px] bg-[#0b0f1a] flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
