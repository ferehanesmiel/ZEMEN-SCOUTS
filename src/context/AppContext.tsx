import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { db, auth as firebaseAuth } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getDocFromServer,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
      isAnonymous: firebaseAuth.currentUser?.isAnonymous,
      tenantId: firebaseAuth.currentUser?.tenantId,
      providerInfo: firebaseAuth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  verificationRequirements?: string[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  balance: number;
  completedTasks: number;
  submittedPlaces: number;
  verifiedPlaces: number;
  rank: number;
  isGuest: boolean;
  pendingSBR: number;
  badges?: string[];
  achievements?: { id: string; name: string; date: string }[];
  streak: number;
  lastActive: string;
  status: 'active' | 'suspended';
  dateJoined: string;
  role?: 'admin' | 'user';
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'earn' | 'spend' | 'donate' | 'admin_adjustment';
  amount: number;
  description: string;
  date: string;
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

export interface Product {
  name: string;
  price: number;
  last_updated: string;
}

export interface Place {
  id: string;
  name: string;
  category: "shop" | "cafe" | "hotel" | "pharmacy" | "market" | "street" | "service";
  address: string;
  location: Location;
  photos: string[];
  created_by: string;
  verified: boolean;
  products: Product[];
  created_at: string;
}

export interface Verification {
  id: string;
  placeId: string;
  placeName: string;
  price?: string;
  availability: 'Available' | 'Not Available';
  stockQuantity?: number;
  openingHours?: string;
  photoUrls: string[];
  notes?: string;
  location: Location;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  reward: number;
  date: string;
}

export interface TaskSubmission {
  id: string;
  placeId: string;
  placeName: string;
  price?: string;
  availability: 'Available' | 'Not Available';
  stockQuantity?: number;
  openingHours?: string;
  photoUrls: string[];
  notes?: string;
  location: Location;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  reward: number;
  submission_date: string;
}

interface AppState {
  user: User;
  users: User[];
  tasks: Task[];
  places: Place[];
  notifications: string[];
  contributions: Contribution[];
  verifications: Verification[];
  transactions: Transaction[];
  pushNotifications: { id: string; title: string; message: string; type: 'task' | 'reward' | 'announcement'; date: string }[];
  completeTask: (taskId: string) => void;
  addNotification: (message: string) => void;
  sendPushNotification: (title: string, message: string, type: 'task' | 'reward' | 'announcement') => void;
  addContribution: (contribution: Omit<Contribution, 'id' | 'status' | 'submittedBy' | 'date'>) => void;
  approveContribution: (id: string) => void;
  rejectContribution: (id: string) => void;
  requestEditContribution: (id: string) => void;
  submitVerification: (verification: Omit<Verification, 'id' | 'status' | 'submittedBy' | 'date'>) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string) => void;
  createTask: (task: Omit<Task, 'id' | 'status' | 'created_at'>) => void;
  submitTask: (submission: Omit<Verification, 'id' | 'status' | 'date'>) => void;
  approveSubmission: (id: string) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  deleteUser: (userId: string) => void;
  mergeGuestWallet: (guestId: string, targetUserId: string) => void;
  adjustUserBalance: (userId: string, amount: number, description: string) => void;
  updateContributionLocation: (id: string, location: Location) => void;
  deleteContribution: (id: string) => void;
  broadcastNotification: (message: string) => void;
  signUp: () => void;
  addPlace: (place: Omit<Place, 'id' | 'verified' | 'created_at' | 'created_by'>) => Promise<void>;
  verifyPlace: (id: string) => Promise<void>;
  updatePlaceProducts: (id: string, products: Product[]) => Promise<void>;
  stats: {
    activeUsers: number;
    completedTasks: number;
    sbrCirculation: number;
    verifiedShops: number;
    dailyActivity: number[];
    categoryGrowth: { name: string; value: number }[];
    userGrowth: { date: string; count: number }[];
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
  streak: 0,
  lastActive: new Date().toISOString(),
  status: 'active',
  dateJoined: new Date().toISOString(),
};

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Kidist Tadesse',
    email: 'kidist@example.com',
    phone: '+251 911 223344',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kidist',
    balance: 1250,
    pendingSBR: 0,
    completedTasks: 45,
    submittedPlaces: 12,
    verifiedPlaces: 8,
    rank: 1,
    isGuest: false,
    badges: ['Top Scout', 'Verified Pioneer'],
    achievements: [{ id: 'a1', name: 'First 10 Tasks', date: '2025-11-01' }],
    streak: 12,
    lastActive: new Date().toISOString(),
    status: 'active',
    dateJoined: '2025-10-15T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'Dawit Mekonnen',
    email: 'dawit@example.com',
    phone: '+251 922 334455',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dawit',
    balance: 980,
    pendingSBR: 0,
    completedTasks: 38,
    submittedPlaces: 10,
    verifiedPlaces: 7,
    rank: 2,
    isGuest: false,
    badges: ['Market Expert'],
    streak: 5,
    lastActive: new Date().toISOString(),
    status: 'active',
    dateJoined: '2025-11-02T14:30:00Z',
  },
  {
    id: 'u3',
    name: 'Helen Girmay',
    email: 'helen@example.com',
    phone: '+251 933 445566',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helen',
    balance: 850,
    pendingSBR: 0,
    completedTasks: 32,
    submittedPlaces: 8,
    verifiedPlaces: 5,
    rank: 3,
    isGuest: false,
    badges: ['Active Contributor'],
    streak: 8,
    lastActive: new Date().toISOString(),
    status: 'active',
    dateJoined: '2025-12-20T09:15:00Z',
  }
];

const mockTransactions: Transaction[] = [
  { id: 'tx1', userId: 'u1', userName: 'Kidist Tadesse', type: 'earn', amount: 15, description: 'Verified Sugar Price', date: new Date().toISOString() },
  { id: 'tx2', userId: 'u2', userName: 'Dawit Mekonnen', type: 'earn', amount: 20, description: 'Medicine Availability Check', date: new Date().toISOString() },
  { id: 'tx3', userId: 'u3', userName: 'Helen Girmay', type: 'spend', amount: 50, description: 'Voucher Purchase', date: new Date().toISOString() },
];

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
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('zemen_user');
    if (saved) return JSON.parse(saved);
    return {
      id: 'temp',
      name: 'Scout',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Scout',
      balance: 0,
      pendingSBR: 0,
      completedTasks: 0,
      submittedPlaces: 0,
      verifiedPlaces: 0,
      rank: 999,
      isGuest: false,
      streak: 0,
      lastActive: new Date().toISOString(),
      status: 'active',
      dateJoined: new Date().toISOString(),
    };
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  // Sync user profile with Firestore
  useEffect(() => {
    if (!authUser) return;

    const userRef = doc(db, 'users', authUser.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        
        // Auto-upgrade to admin if email matches
        if (authUser.email === 'esmielferehan@gmail.com' && userData.role !== 'admin') {
          updateDoc(userRef, { role: 'admin' }).catch(err => console.error("Error auto-upgrading admin:", err));
        }

        setUser(prev => ({
          ...prev,
          ...userData,
          id: authUser.uid,
          name: authUser.displayName || userData.name || 'Scout',
          email: authUser.email || userData.email || '',
          avatar: authUser.photoURL || userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}`,
          isGuest: false,
          role: authUser.email === 'esmielferehan@gmail.com' ? 'admin' : userData.role,
        }));
      } else {
        // Create initial user profile in Firestore if it doesn't exist
        const isAdmin = authUser.email === 'esmielferehan@gmail.com';
        const newUser: User = {
          id: authUser.uid,
          name: authUser.displayName || 'Scout',
          email: authUser.email || '',
          avatar: authUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}`,
          balance: 0,
          pendingSBR: 0,
          completedTasks: 0,
          submittedPlaces: 0,
          verifiedPlaces: 0,
          rank: 999,
          isGuest: false,
          streak: 0,
          lastActive: new Date().toISOString(),
          status: 'active',
          dateJoined: new Date().toISOString(),
          role: isAdmin ? 'admin' : 'user',
        };
        
        setDoc(userRef, newUser).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}`));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`));

    return () => unsubscribe();
  }, [authUser]);

  // Sync collections with Firestore
  useEffect(() => {
    if (!authUser) return;

    const tasksUnsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      if (tasksData.length > 0) setTasks(tasksData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    const placesUnsubscribe = onSnapshot(collection(db, 'places'), (snapshot) => {
      const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
      setPlaces(placesData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'places'));

    const contributionsUnsubscribe = onSnapshot(collection(db, 'contributions'), (snapshot) => {
      const contributionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contribution));
      if (contributionsData.length > 0) setContributions(contributionsData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contributions'));

    const transactionsQuery = user.role === 'admin'
      ? query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(200))
      : query(collection(db, 'transactions'), where('userId', '==', authUser.uid), orderBy('date', 'desc'), limit(50));

    const transactionsUnsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(transactionsData);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
    );

    const verificationsQuery = user.role === 'admin'
      ? collection(db, 'verifications')
      : query(collection(db, 'verifications'), where('submittedBy', '==', authUser.uid));

    const verificationsUnsubscribe = onSnapshot(
      verificationsQuery,
      (snapshot) => {
        const verificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Verification));
        setVerifications(verificationsData);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'verifications')
    );

    return () => {
      tasksUnsubscribe();
      placesUnsubscribe();
      contributionsUnsubscribe();
      transactionsUnsubscribe();
      verificationsUnsubscribe();
    };
  }, [authUser, user.role]);

  // Fetch all users for admin
  useEffect(() => {
    if (!authUser || user.role !== 'admin') return;

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => {
      usersUnsubscribe();
    };
  }, [authUser, user.role]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [pushNotifications, setPushNotifications] = useState<{ id: string; title: string; message: string; type: 'task' | 'reward' | 'announcement'; date: string }[]>([]);

  useEffect(() => {
    // Check for streak update on load
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      if (authUser) {
        updateDoc(doc(db, 'users', authUser.uid), {
          streak: user.streak + 1,
          lastActive: now.toISOString()
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${authUser.uid}`));
      }
      sendPushNotification('Streak Maintained!', `Day ${user.streak + 1} 🔥 Keep it up!`, 'reward');
    } else if (diffDays > 1) {
      if (authUser) {
        updateDoc(doc(db, 'users', authUser.uid), {
          streak: 1,
          lastActive: now.toISOString()
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${authUser.uid}`));
      }
      sendPushNotification('Streak Reset', 'Start again to earn bonuses.', 'announcement');
    }
  }, [user.id]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 4000);
  };

  const sendPushNotification = (title: string, message: string, type: 'task' | 'reward' | 'announcement') => {
    const newPush = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      date: new Date().toISOString()
    };
    setPushNotifications(prev => [newPush, ...prev]);
    addNotification(`New ${type}: ${title}`);
  };

  const submitTask = async (submission: Omit<TaskSubmission, 'id' | 'status' | 'submission_date'>) => {
    try {
      const newSubmissionData = {
        ...submission,
        status: 'pending',
        submission_date: new Date().toISOString(),
      };
      await addDoc(collection(db, 'task_submissions'), newSubmissionData);
      addNotification("Task submitted for approval!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'task_submissions');
    }
  };

  const approveSubmission = async (id: string) => {
    try {
      const submissionRef = doc(db, 'task_submissions', id);
      await updateDoc(submissionRef, { status: 'approved' });
      addNotification("Submission approved!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `task_submissions/${id}`);
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'status' | 'created_at'>) => {
    try {
      const newTaskData = {
        ...task,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      await addDoc(collection(db, 'tasks'), newTaskData);
      addNotification("Task created successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const addPlace = async (place: Omit<Place, 'id' | 'verified' | 'created_at' | 'created_by'>) => {
    if (!authUser) return;
    try {
      const newPlaceData = {
        ...place,
        verified: false,
        created_by: authUser.uid,
        created_at: new Date().toISOString(),
      };
      await addDoc(collection(db, 'places'), newPlaceData);
      addNotification("New place added to the shared map!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'places');
    }
  };

  const verifyPlace = async (id: string) => {
    if (user.role !== 'admin') return;
    try {
      const placeRef = doc(db, 'places', id);
      await updateDoc(placeRef, { verified: true });
      addNotification("Place verified and live for Runner Link!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `places/${id}`);
    }
  };

  const updatePlaceProducts = async (id: string, products: Product[]) => {
    if (!authUser || (user.role !== 'scout' && user.role !== 'admin')) return;
    try {
      const placeRef = doc(db, 'places', id);
      await updateDoc(placeRef, { products });
      addNotification("Product information updated!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `places/${id}`);
    }
  };

  const updatePlaceLocation = async (id: string, location: { lat: number, lng: number }) => {
    if (!authUser || (user.role !== 'scout' && user.role !== 'admin')) return;
    try {
      const placeRef = doc(db, 'places', id);
      await updateDoc(placeRef, { location });
      addNotification("Place location updated on map.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `places/${id}`);
    }
  };

  const deletePlace = async (id: string) => {
    if (user.role !== 'admin') return;
    try {
      const placeRef = doc(db, 'places', id);
      await deleteDoc(placeRef);
      addNotification("Place removed from map.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `places/${id}`);
    }
  };

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'completed') return;

    if (user.isGuest && !task.isGuestPreview) {
      addNotification("Sign up to complete this task and earn real SBR!");
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: 'completed' });
      
      if (user.isGuest) {
        setUser(prev => ({
          ...prev,
          pendingSBR: prev.pendingSBR + task.reward,
          completedTasks: prev.completedTasks + 1
        }));
        sendPushNotification('Task Completed!', `+${task.reward} Demo SBR earned! Sign up to claim.`, 'reward');
      } else if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        await updateDoc(userRef, {
          balance: user.balance + task.reward,
          completedTasks: user.completedTasks + 1
        });

        // Add transaction
        await addDoc(collection(db, 'transactions'), {
          userId: authUser.uid,
          userName: user.name,
          type: 'earn',
          amount: task.reward,
          description: `Completed task: ${task.title}`,
          date: new Date().toISOString()
        });

        sendPushNotification('Task Completed!', `+${task.reward} SBR added to your wallet.`, 'reward');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const addContribution = async (contribution: Omit<Contribution, 'id' | 'status' | 'submittedBy' | 'date'>) => {
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

    try {
      const newContributionData = {
        ...contribution,
        status: 'pending',
        submittedBy: user.id,
        date: new Date().toISOString(),
      };

      await addDoc(collection(db, 'contributions'), newContributionData);
      
      if (user.isGuest) {
        setUser(prev => ({ 
          ...prev, 
          pendingSBR: prev.pendingSBR + contribution.reward,
          submittedPlaces: prev.submittedPlaces + 1
        }));
        addNotification(`Contribution submitted! +${contribution.reward} Demo SBR (pending verification).`);
      } else if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        await updateDoc(userRef, {
          submittedPlaces: user.submittedPlaces + 1
        });
        addNotification(`Contribution submitted! +${contribution.reward} SBR will be added after verification.`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contributions');
    }
  };

  const approveContribution = async (id: string) => {
    const contribution = contributions.find(c => c.id === id);
    if (!contribution || contribution.status !== 'pending') return;

    try {
      const contributionRef = doc(db, 'contributions', id);
      await updateDoc(contributionRef, { status: 'approved' });
      
      // Create a new task based on this approved place in Firestore
      const newTaskData = {
        title: `Verify details for ${contribution.name}`,
        description: `Check if the information for ${contribution.name} is still accurate.`,
        reward: 10,
        type: 'location_check',
        location: contribution.location,
        placeName: contribution.name,
        status: 'available',
        created_at: new Date().toISOString()
      };
      await addDoc(collection(db, 'tasks'), newTaskData);
      
      // If it was submitted by the current user
      if (contribution.submittedBy === user.id && !user.isGuest && authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        await updateDoc(userRef, {
          balance: user.balance + contribution.reward,
          verifiedPlaces: user.verifiedPlaces + 1
        });
        
        // Add transaction
        await addDoc(collection(db, 'transactions'), {
          userId: authUser.uid,
          userName: user.name,
          type: 'earn',
          amount: contribution.reward,
          description: `Contribution approved: ${contribution.name}`,
          date: new Date().toISOString()
        });

        sendPushNotification('Contribution Approved!', `+${contribution.reward} SBR added for ${contribution.name}.`, 'reward');
      } else if (contribution.submittedBy === user.id) {
        sendPushNotification('Contribution Approved!', `${contribution.name} is now live on the map!`, 'announcement');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contributions/${id}`);
    }
  };

  const rejectContribution = async (id: string) => {
    try {
      const contributionRef = doc(db, 'contributions', id);
      await updateDoc(contributionRef, { status: 'rejected' });
      addNotification("Contribution rejected.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contributions/${id}`);
    }
  };

  const requestEditContribution = (id: string) => {
    setContributions(prev => prev.map(c => c.id === id ? { ...c, status: 'pending' } : c));
    addNotification("Edit requested for contribution.");
  };

  const submitVerification = async (verification: Omit<Verification, 'id' | 'status' | 'submittedBy' | 'date'>) => {
    try {
      const newVerificationData = {
        ...verification,
        status: 'pending',
        submittedBy: user.id,
        date: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'verifications'), newVerificationData);

      if (user.isGuest) {
        setUser(prev => ({ 
          ...prev, 
          pendingSBR: prev.pendingSBR + verification.reward 
        }));
        addNotification(`Verification submitted! +${verification.reward} Demo SBR (pending).`);
      } else {
        addNotification(`Verification submitted! +${verification.reward} SBR pending approval.`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'verifications');
    }
  };

  const approveVerification = async (id: string) => {
    const verification = verifications.find(v => v.id === id);
    if (!verification || verification.status !== 'pending') return;

    try {
      const verificationRef = doc(db, 'verifications', id);
      await updateDoc(verificationRef, { status: 'approved' });
      
      if (verification.submittedBy === user.id && !user.isGuest && authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        await updateDoc(userRef, {
          balance: user.balance + verification.reward,
          verifiedPlaces: user.verifiedPlaces + 1
        });

        // Add transaction
        await addDoc(collection(db, 'transactions'), {
          userId: authUser.uid,
          userName: user.name,
          type: 'earn',
          amount: verification.reward,
          description: `Verification approved: ${verification.placeName}`,
          date: new Date().toISOString()
        });

        addNotification(`Verification approved! +${verification.reward} SBR added.`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `verifications/${id}`);
    }
  };

  const rejectVerification = async (id: string) => {
    try {
      const verificationRef = doc(db, 'verifications', id);
      await updateDoc(verificationRef, { status: 'rejected' });
      addNotification("Verification rejected.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `verifications/${id}`);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status });
      addNotification(`User status updated to ${status}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteUser = async (userId: string) => {
    // In a real app, we might just suspend or use a cloud function to delete
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: 'suspended' }); // Soft delete for safety
      addNotification("User suspended successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const mergeGuestWallet = async (guestId: string, targetUserId: string) => {
    // This would typically involve a cloud function or a batch write
    // For now, we'll just adjust the balance of the target user
    const guest = users.find(u => u.id === guestId) || (user.id === guestId ? user : null);
    if (!guest) return;

    const amount = guest.balance + guest.pendingSBR;
    await adjustUserBalance(targetUserId, amount, `Merged from guest ${guestId}`);
    
    if (user.id === guestId) {
      // If the current user was the guest, they are now logged in and their balance is updated via adjustUserBalance
    }
    addNotification(`Merged ${amount} SBR from guest wallet.`);
  };

  const adjustUserBalance = async (userId: string, amount: number, description: string) => {
    try {
      const targetUser = users.find(u => u.id === userId) || (user.id === userId ? user : null);
      if (!targetUser) return;

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        balance: targetUser.balance + amount
      });

      // Add transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        userName: targetUser.name,
        type: 'admin_adjustment',
        amount,
        description,
        date: new Date().toISOString(),
      });

      addNotification(`Balance adjusted by ${amount} SBR.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateContributionLocation = async (id: string, location: Location) => {
    try {
      const contributionRef = doc(db, 'contributions', id);
      await updateDoc(contributionRef, { location });
      addNotification("Place location updated on map.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contributions/${id}`);
    }
  };

  const deleteContribution = async (id: string) => {
    try {
      const contributionRef = doc(db, 'contributions', id);
      await updateDoc(contributionRef, { status: 'rejected' }); // Soft delete
      addNotification("Place removed from map.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contributions/${id}`);
    }
  };

  const broadcastNotification = (message: string) => {
    addNotification(`BROADCAST: ${message}`);
    // In a real app, this would send to all connected clients via WebSockets/Push
  };

  const stats = {
    activeUsers: users.length + (user.isGuest ? 0 : 1),
    completedTasks: 8432 + user.completedTasks + users.reduce((acc, u) => acc + u.completedTasks, 0),
    sbrCirculation: 45200 + user.balance + users.reduce((acc, u) => acc + u.balance, 0),
    verifiedShops: places.filter(p => p.verified).length,
    totalPlaces: places.length,
    pendingPlaces: places.filter(p => !p.verified).length,
    dailyActivity: [40, 60, 45, 80, 55, 90, 75],
    categoryGrowth: [
      { name: 'Shops', value: 45 },
      { name: 'Cafes', value: 32 },
      { name: 'Services', value: 18 },
      { name: 'Others', value: 5 },
    ],
    userGrowth: [
      { date: '2025-01', count: 120 },
      { date: '2025-02', count: 250 },
      { date: '2025-03', count: 480 },
      { date: '2025-04', count: 850 },
      { date: '2025-05', count: 1200 },
    ]
  };

  const signUp = () => {
    // This is now handled by Firebase Auth
    addNotification("Welcome! Start your scouting journey.");
  };

  return (
    <AppContext.Provider value={{ 
      user, users, tasks, places, notifications, pushNotifications, contributions, verifications, transactions,
      completeTask, addNotification, sendPushNotification, addContribution, 
      approveContribution, rejectContribution, requestEditContribution,
      submitVerification, approveVerification, rejectVerification,
      createTask, submitTask, approveSubmission,
      updateUserStatus, deleteUser, mergeGuestWallet, adjustUserBalance,
      updateContributionLocation, deleteContribution, broadcastNotification,
      signUp, addPlace, verifyPlace, updatePlaceLocation, deletePlace, updatePlaceProducts, stats
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

