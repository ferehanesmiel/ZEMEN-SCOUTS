import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import confetti from 'canvas-confetti';

export type TaskStatus = 'available' | 'in_progress' | 'completed';

export interface Location {
  lat: number;
  lng: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'price_check' | 'availability' | 'photo_verification' | 'location_check';
  location: Location;
  placeName: string;
  status: TaskStatus;
  isGuestPreview?: boolean;
  isPremium?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  completedTasks: number;
  submittedPlaces: number;
  verifiedPlaces: number;
  rank: number;
  isGuest: boolean;
  pendingSBR: number;
}

export interface Contribution {
  id: string;
  name: string;
  category: string;
  address: string;
  notes: string;
  products?: string;
  openingHours?: string;
  location: Location;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  reward: number;
  date: string;
  photoUrls?: string[];
}

interface AppState {
  user: User;
  tasks: Task[];
  notifications: string[];
  contributions: Contribution[];
  completeTask: (taskId: string) => void;
  addNotification: (message: string) => void;
  addContribution: (contribution: Omit<Contribution, 'id' | 'status' | 'submittedBy' | 'date'>) => void;
  approveContribution: (id: string) => void;
  rejectContribution: (id: string) => void;
  requestEditContribution: (id: string) => void;
  signUp: () => void;
  stats: {
    activeUsers: number;
    completedTasks: number;
    sbrCirculation: number;
    verifiedShops: number;
  };
}

const initialGuestUser: User = {
  id: 'guest_' + Math.random().toString(36).substr(2, 9),
  name: 'Guest Explorer',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  balance: 0,
  pendingSBR: 0,
  completedTasks: 0,
  submittedPlaces: 0,
  verifiedPlaces: 0,
  rank: 999,
  isGuest: true,
};

// Demo tasks in Addis Ababa
const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Verify Sugar Price',
    description: 'Check the current price of 1kg sugar at Shoa Supermarket.',
    reward: 15,
    type: 'price_check',
    location: { lat: 9.0105, lng: 38.7613 }, // Bole area
    placeName: 'Shoa Supermarket',
    status: 'available',
  },
  {
    id: 't2',
    title: 'Medicine Availability',
    description: 'Check if Amoxicillin is in stock at Kenema Pharmacy.',
    reward: 20,
    type: 'availability',
    location: { lat: 9.0227, lng: 38.7468 }, // Piassa area
    placeName: 'Kenema Pharmacy',
    status: 'available',
    isGuestPreview: true,
  },
  {
    id: 't3',
    title: 'Hotel Front Photo',
    description: 'Take a clear photo of the entrance of Skylight Hotel.',
    reward: 30,
    type: 'photo_verification',
    location: { lat: 8.9892, lng: 38.7885 }, // Airport area
    placeName: 'Skylight Hotel',
    status: 'available',
    isPremium: true,
  },
  {
    id: 't4',
    title: 'Market Produce Check',
    description: 'Verify the price of Teff at Shola Market.',
    reward: 25,
    type: 'price_check',
    location: { lat: 9.0272, lng: 38.7895 }, // Shola area
    placeName: 'Shola Market',
    status: 'available',
    isGuestPreview: true,
  },
  {
    id: 't5',
    title: 'Confirm New Cafe Location',
    description: 'Verify if Tomoca Coffee has opened a new branch here.',
    reward: 10,
    type: 'location_check',
    location: { lat: 9.0065, lng: 38.7673 },
    placeName: 'Tomoca Coffee',
    status: 'available',
  },
  {
    id: 't6',
    title: 'Farmer Market Prices',
    description: 'Check the price of onions at the local farmers market.',
    reward: 20,
    type: 'price_check',
    location: { lat: 9.0350, lng: 38.7500 }, // Addisu Gebeya
    placeName: 'Addisu Gebeya Market',
    status: 'available',
  },
  {
    id: 't7',
    title: 'Service Hub Verification',
    description: 'Verify the opening hours of the new Ethio Telecom branch.',
    reward: 15,
    type: 'availability',
    location: { lat: 9.0150, lng: 38.7550 }, // Kazanchis
    placeName: 'Ethio Telecom Kazanchis',
    status: 'available',
    isGuestPreview: true,
  },
  {
    id: 't8',
    title: 'Landmark Photo',
    description: 'Take a clear photo of the Meskel Square monument.',
    reward: 35,
    type: 'photo_verification',
    location: { lat: 9.0100, lng: 38.7600 }, // Meskel Square
    placeName: 'Meskel Square',
    status: 'available',
  }
];

const initialContributions: Contribution[] = [
  {
    id: 'c1',
    name: 'New Kiosk',
    category: 'Shop',
    address: 'Bole Rwanda',
    notes: 'Sells basic groceries',
    location: { lat: 9.0012, lng: 38.7721 },
    status: 'pending',
    submittedBy: 'guest_123',
    reward: 10,
    date: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Alem Pharmacy',
    category: 'Pharmacy',
    address: 'Megenagna',
    notes: 'Open 24/7',
    location: { lat: 9.0180, lng: 38.7950 },
    status: 'approved',
    submittedBy: 'user_456',
    reward: 15,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'c3',
    name: 'Fresh Farm Produce',
    category: 'Market',
    address: 'Saris',
    notes: 'Direct from farmers',
    location: { lat: 8.9800, lng: 38.7600 },
    status: 'pending',
    submittedBy: 'guest_123',
    reward: 20,
    date: new Date().toISOString(),
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('zemen_user');
    if (saved) return JSON.parse(saved);
    return initialGuestUser;
  });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('zemen_user', JSON.stringify(user));
  }, [user]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 4000);
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'completed') return;

    if (user.isGuest && !task.isGuestPreview) {
      addNotification("Sign up to complete this task and earn real SBR!");
      return;
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    
    if (user.isGuest) {
      setUser(prev => ({
        ...prev,
        pendingSBR: prev.pendingSBR + task.reward,
        completedTasks: prev.completedTasks + 1
      }));
      addNotification(`+${task.reward} Demo SBR earned! Sign up to claim.`);
    } else {
      setUser(prev => ({
        ...prev,
        balance: prev.balance + task.reward,
        completedTasks: prev.completedTasks + 1
      }));
      addNotification(`+${task.reward} SBR earned! Task completed.`);
    }
  };

  const addContribution = (contribution: Omit<Contribution, 'id' | 'status' | 'submittedBy' | 'date'>) => {
    if (user.isGuest) {
      const today = new Date().toISOString().split('T')[0];
      const guestSubmissionsToday = contributions.filter(
        c => c.submittedBy === user.id && c.date.startsWith(today)
      ).length;

      if (guestSubmissionsToday >= 3) {
        addNotification("Guest limit reached: 3 submissions per day. Sign up to submit more!");
        return;
      }
    }

    const newContribution: Contribution = {
      ...contribution,
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      submittedBy: user.id,
      date: new Date().toISOString(),
    };
    setContributions(prev => [...prev, newContribution]);
    
    if (user.isGuest) {
      setUser(prev => ({ 
        ...prev, 
        pendingSBR: prev.pendingSBR + contribution.reward,
        submittedPlaces: prev.submittedPlaces + 1
      }));
      addNotification(`Contribution submitted! +${contribution.reward} Demo SBR (pending verification).`);
    } else {
      setUser(prev => ({
        ...prev,
        submittedPlaces: prev.submittedPlaces + 1
      }));
      addNotification(`Contribution submitted! +${contribution.reward} SBR will be added after verification.`);
    }
  };

  const approveContribution = (id: string) => {
    const contribution = contributions.find(c => c.id === id);
    if (!contribution || contribution.status !== 'pending') return;

    setContributions(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    
    // Create a new task based on this approved place
    const newTask: Task = {
      id: 't_' + Math.random().toString(36).substr(2, 9),
      title: `Verify details for ${contribution.name}`,
      description: `Check if the information for ${contribution.name} is still accurate.`,
      reward: 10,
      type: 'location_check',
      location: contribution.location,
      placeName: contribution.name,
      status: 'available',
    };
    setTasks(prev => [...prev, newTask]);
    
    // If it was submitted by the current user (and they are not a guest anymore, or we just add to balance)
    if (contribution.submittedBy === user.id && !user.isGuest) {
       setUser(prev => ({ 
         ...prev, 
         balance: prev.balance + contribution.reward,
         verifiedPlaces: prev.verifiedPlaces + 1
       }));
       addNotification(`Contribution approved! +${contribution.reward} SBR added to wallet.`);
    } else if (contribution.submittedBy === user.id) {
       setUser(prev => ({
         ...prev,
         verifiedPlaces: prev.verifiedPlaces + 1
       }));
    }
  };

  const rejectContribution = (id: string) => {
    setContributions(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    addNotification("Contribution rejected.");
  };

  const requestEditContribution = (id: string) => {
    setContributions(prev => prev.map(c => c.id === id ? { ...c, status: 'pending' } : c));
    addNotification("Edit requested for contribution.");
  };

  const stats = {
    activeUsers: 1245 + (user.isGuest ? 0 : 1),
    completedTasks: 8432 + user.completedTasks,
    sbrCirculation: 45200 + user.balance,
    verifiedShops: 342 + contributions.filter(c => c.status === 'approved').length,
  };

  const signUp = () => {
    setUser(prev => ({
      ...prev,
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: 'New Scout',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewScout',
      balance: prev.balance + prev.pendingSBR, // Merge pending SBR
      pendingSBR: 0,
      isGuest: false,
      rank: Math.floor(Math.random() * 100) + 10,
    }));
    addNotification("Welcome! Your demo SBR has been converted to real SBR.");
    
    // Trigger confetti animation
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6a00', '#ffaa00', '#ffffff']
    });
  };

  return (
    <AppContext.Provider value={{ 
      user, tasks, notifications, contributions, 
      completeTask, addNotification, addContribution, 
      approveContribution, rejectContribution, requestEditContribution, signUp, stats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

