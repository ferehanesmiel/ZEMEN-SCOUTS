import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  completedTasks: number;
  rank: number;
}

interface AppState {
  user: User;
  tasks: Task[];
  notifications: string[];
  completeTask: (taskId: string) => void;
  addNotification: (message: string) => void;
}

const initialUser: User = {
  id: 'u1',
  name: 'Abebe B.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abebe',
  balance: 150,
  completedTasks: 12,
  rank: 4,
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
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 4000);
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'completed') return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    setUser(prev => ({
      ...prev,
      balance: prev.balance + task.reward,
      completedTasks: prev.completedTasks + 1
    }));
    
    addNotification(`+${task.reward} SBR earned! Task completed.`);
  };

  return (
    <AppContext.Provider value={{ user, tasks, notifications, completeTask, addNotification }}>
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
