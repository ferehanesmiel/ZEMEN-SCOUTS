import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, Task, Contribution, Place, Product } from '../context/AppContext';
import { MapPin, Navigation, CheckCircle, X, Plus, Store, Camera, Image as ImageIcon, Star, Coins, Info, AlertCircle, Layers, Bike, Search, Filter, LocateFixed } from 'lucide-react';
import confetti from 'canvas-confetti';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createAnimatedIcon = (colorClass: string, isPulsing: boolean = false, iconName?: string) => {
  const iconHtml = iconName ? `
    <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black p-1.5 rounded-full shadow-lg border-2 ${colorClass.replace('bg-', 'border-')}">
      <div class="w-4 h-4">${iconName}</div>
    </div>
  ` : '';

  return new L.DivIcon({
    className: 'custom-div-icon bg-transparent border-none',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 -mt-4 -ml-4">
        ${isPulsing ? `<div class="absolute inset-0 rounded-full ${colorClass} opacity-40 animate-ping" style="animation-duration: 2s;"></div>` : ''}
        <div class="relative z-10 w-6 h-6 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        ${iconHtml}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const userIcon = new L.DivIcon({
  className: 'custom-div-icon bg-transparent border-none',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8 -mt-4 -ml-4">
      <div class="absolute inset-0 rounded-full bg-blue-500 opacity-40 animate-ping" style="animation-duration: 2s;"></div>
      <div class="relative z-10 w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
        <div class="w-2 h-2 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'cafe': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>';
    case 'restaurant': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>';
    case 'shop': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>';
    case 'pharmacy': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>';
    case 'hotel': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v5"/><path d="M2 22V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v18"/><path d="M6 6h.01"/><path d="M6 10h.01"/><path d="M6 14h.01"/><path d="M10 6h.01"/><path d="M10 10h.01"/><path d="M14 6h.01"/><path d="M14 10h.01"/><path d="M18 6h.01"/><path d="M18 10h.01"/><path d="M18 14h.01"/></svg>';
    default: return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  }
};

const customIcon = createAnimatedIcon('bg-[var(--color-sbr-orange)]', true);
const pendingIcon = createAnimatedIcon('bg-gray-500', true);

// Component to recenter map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

// Component to handle map clicks for adding new places
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default function MapView() {
  const { 
    tasks, completeTask, contributions, addContribution, verifications, 
    submitVerification, user, signUp, places, addPlace, verifyPlace, addNotification 
  } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [center, setCenter] = useState({ lat: 9.0227, lng: 38.7468 }); // Addis Ababa
  
  const [activeLayer, setActiveLayer] = useState<'scout' | 'runner'>('scout');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showRunnerForm, setShowRunnerForm] = useState(false);
  const [runnerForm, setRunnerForm] = useState({
    pickup: '',
    dropoff: '',
    items: '',
    urgency: 'normal' as 'normal' | 'express' | 'scheduled'
  });

  const handleSendRunner = (place: Place) => {
    setRunnerForm({
      ...runnerForm,
      pickup: place.name + ', ' + place.address
    });
    setShowRunnerForm(true);
  };

  const submitRunnerRequest = () => {
    addNotification(`Runner request sent for ${runnerForm.items}!`);
    setShowRunnerForm(false);
    setSelectedPlace(null);
  };
  
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceLocation, setNewPlaceLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newPlaceForm, setNewPlaceForm] = useState({ name: '', category: 'Shop', address: '', notes: '', products: '', openingHours: '' });
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingPlace, setVerifyingPlace] = useState<{id: string, name: string, category: string, address: string, location: {lat: number, lng: number}, photos?: string[] } | null>(null);
  const [verificationForm, setVerificationForm] = useState({ price: '', availability: 'Available' as 'Available' | 'Not Available', stockQuantity: '', openingHours: '', notes: '' });
  const [verificationLocation, setVerificationLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  // Auto-center on load and watch position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setCenter({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error getting initial location:", error)
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error watching location:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Check arrival distance
  useEffect(() => {
    if (userLocation && selectedTask) {
      // Calculate distance using Haversine formula
      const R = 6371e3; // metres
      const φ1 = userLocation.lat * Math.PI/180; // φ, λ in radians
      const φ2 = selectedTask.location.lat * Math.PI/180;
      const Δφ = (selectedTask.location.lat - userLocation.lat) * Math.PI/180;
      const Δλ = (selectedTask.location.lng - userLocation.lng) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      const d = R * c; // in metres

      if (d < 50 && !hasArrived) { // within 50 meters
        setHasArrived(true);
        addNotification(`You have arrived at ${selectedTask.placeName}!`);
      } else if (d >= 50 && hasArrived) {
        setHasArrived(false);
      }
    }
  }, [userLocation, selectedTask, hasArrived, addNotification]);

  const handleAddPlaceClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setNewPlaceLocation({ lat: latitude, lng: longitude });
          setCenter({ lat: latitude, lng: longitude });
          setIsAddingPlace(true);
          // Auto-fill address with a mock value based on location
          setNewPlaceForm(prev => ({ ...prev, address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsAddingPlace(true);
        }
      );
    } else {
      setIsAddingPlace(true);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingPlace) {
      setNewPlaceLocation({ lat, lng });
      setNewPlaceForm(prev => ({ ...prev, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const newPreviews: string[] = [];
      let loadedCount = 0;
      
      const maxFiles = Math.min(files.length, 3 - photoPreviews.length);
      
      for (let i = 0; i < maxFiles; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === maxFiles) {
            setPhotoPreviews(prev => [...prev, ...newPreviews].slice(0, 3));
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const submitNewPlace = async () => {
    if (!newPlaceLocation || !newPlaceForm.name) return;
    
    await addPlace({
      name: newPlaceForm.name,
      category: newPlaceForm.category as any,
      address: newPlaceForm.address || 'Unknown Address',
      location: newPlaceLocation,
      photos: photoPreviews,
      products: newPlaceForm.products ? newPlaceForm.products.split(',').map(p => ({ name: p.trim(), price: 0, last_updated: new Date().toISOString() })) : [],
    });
    
    setIsAddingPlace(false);
    setNewPlaceLocation(null);
    setNewPlaceForm({ name: '', category: 'Shop', address: '', notes: '', products: '', openingHours: '' });
    setPhotoPreviews([]);
    
    // Coin animation
    setShowCoinAnimation(true);
    setTimeout(() => setShowCoinAnimation(false), 2000);
  };

  const handleStartVerification = (place: any) => {
    setVerifyingPlace(place);
    setVerificationLocation(place.location);
    setIsVerifying(true);
    setSelectedTask(null);
    
    // Try to get current location for confirmation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setVerificationLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const submitVerificationForm = () => {
    if (!verifyingPlace || !verificationLocation) return;
    
    submitVerification({
      placeId: verifyingPlace.id,
      placeName: verifyingPlace.name,
      price: verificationForm.price,
      availability: verificationForm.availability,
      stockQuantity: verificationForm.stockQuantity ? parseInt(verificationForm.stockQuantity) : undefined,
      openingHours: verificationForm.openingHours,
      notes: verificationForm.notes,
      location: verificationLocation,
      photoUrls: photoPreviews,
      reward: 5, // Reward for verification
    });
    
    setIsVerifying(false);
    setVerifyingPlace(null);
    setVerificationForm({ price: '', availability: 'Available', stockQuantity: '', openingHours: '', notes: '' });
    setPhotoPreviews([]);
    
    // Coin animation
    setShowCoinAnimation(true);
    setTimeout(() => setShowCoinAnimation(false), 2000);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6a00', '#ffaa00']
    });
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Shared Places Layer */}
        {places
          .filter(p => categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase())
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((place) => {
            const isVerified = place.verified;
            const icon = createAnimatedIcon(
              isVerified ? 'bg-green-500' : 'bg-orange-500', 
              !isVerified, 
              getCategoryIcon(place.category)
            );

            return (
              <Marker 
                key={place.id} 
                position={[place.location.lat, place.location.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedPlace(place);
                    setSelectedTask(null);
                    setCenter(place.location);
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-black">{place.name}</div>
                  <div className="text-xs text-gray-600">{place.category}</div>
                  <div className={`text-[10px] font-bold mt-1 ${isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                    {isVerified ? 'Verified' : 'Pending Verification'}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Tasks Layer (Only for Scouts) */}
        {activeLayer === 'scout' && tasks.map((task) => {
          const verification = verifications.find(v => v.placeId === task.id);
          let icon = customIcon;
          
          if (task.status === 'completed') {
            icon = createAnimatedIcon('bg-green-500', false, getCategoryIcon(task.type));
          } else if (verification) {
            if (verification.status === 'pending') {
              icon = createAnimatedIcon('bg-orange-500', true, '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>');
            } else if (verification.status === 'approved') {
              icon = createAnimatedIcon('bg-green-500', false, '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>');
            }
          }

          return (
            <Marker 
              key={task.id} 
              position={[task.location.lat, task.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  setSelectedTask(task);
                  setSelectedPlace(null);
                  setCenter(task.location);
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="font-bold text-black">{task.placeName}</div>
                <div className="text-xs text-gray-600">{task.title}</div>
                {verification && (
                  <div className={`text-[10px] font-bold mt-1 ${verification.status === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
                    {verification.status === 'pending' ? 'Verification Pending' : 'Verified'}
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {/* Remove old contributions layer as it's replaced by places */}

        {newPlaceLocation && (
          <Marker 
            position={[newPlaceLocation.lat, newPlaceLocation.lng]} 
            icon={pendingIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setNewPlaceLocation({ lat: position.lat, lng: position.lng });
                setNewPlaceForm(prev => ({ ...prev, address: `Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}` }));
              },
            }}
          />
        )}

        {isVerifying && verificationLocation && (
          <Marker 
            position={[verificationLocation.lat, verificationLocation.lng]} 
            icon={createAnimatedIcon('bg-blue-500', true)}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setVerificationLocation({ lat: position.lat, lng: position.lng });
              },
            }}
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="font-bold text-black">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Direction Polyline */}
        {userLocation && selectedTask && (
          <Polyline 
            positions={[
              [userLocation.lat, userLocation.lng],
              [selectedTask.location.lat, selectedTask.location.lng]
            ]} 
            color="var(--color-sbr-orange)" 
            weight={4} 
            dashArray="10, 10" 
            className="animate-pulse"
          />
        )}

        <RecenterMap lat={center.lat} lng={center.lng} />
      </MapContainer>

      {/* Center on Me Button */}
      <div className="absolute bottom-24 right-4 z-[1000]">
        <button 
          onClick={() => {
            if (userLocation) {
              setCenter(userLocation);
            } else {
              addNotification("Location not available yet.");
            }
          }}
          className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full shadow-lg text-white hover:bg-black/80 transition-colors"
        >
          <LocateFixed size={20} />
        </button>
      </div>

      {/* Layer Toggle & Search */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search places..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-sbr-orange)] shadow-lg"
            />
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex p-1 shadow-lg">
            <button 
              onClick={() => setActiveLayer('scout')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${activeLayer === 'scout' ? 'bg-[var(--color-sbr-orange)] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <Navigation size={14} /> Scout
            </button>
            <button 
              onClick={() => setActiveLayer('runner')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${activeLayer === 'runner' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Bike size={14} /> Runner
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar pointer-events-auto">
          {['All', 'Shop', 'Cafe', 'Pharmacy', 'Hotel', 'Market', 'Service'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border backdrop-blur-md transition-all ${categoryFilter === cat ? 'bg-white text-black border-white' : 'bg-black/40 text-gray-300 border-white/10 hover:bg-black/60'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Coin Animation Overlay */}
      <AnimatePresence>
        {showCoinAnimation && (
          <motion.div
            initial={{ scale: 0, x: '50%', y: '50%' }}
            animate={{ scale: [1, 1.2, 0], x: '80%', y: '-80%' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center"
          >
            <div className="bg-[var(--color-sbr-orange)] p-4 rounded-full shadow-[0_0_30px_rgba(255,106,0,0.8)]">
              <Coins size={48} className="text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Place Button */}
      {!isAddingPlace && !isVerifying && !selectedTask && !selectedPlace && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddPlaceClick}
          className="absolute bottom-6 right-4 z-[1000] bg-[var(--color-sbr-orange)] text-black font-bold p-4 rounded-full shadow-[0_0_20px_rgba(255,106,0,0.5)] flex items-center gap-2"
        >
          <Plus size={24} />
          <span className="pr-2">Add Place</span>
        </motion.button>
      )}

      {/* Add Place Instructions */}
      <AnimatePresence>
        {isAddingPlace && !newPlaceLocation && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-[1000] glass-panel rounded-xl p-4 text-center border border-[var(--color-sbr-orange)]/50"
          >
            <p className="font-medium">Tap anywhere on the map to add a new place</p>
            <button 
              onClick={() => setIsAddingPlace(false)}
              className="mt-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Place Form */}
      <AnimatePresence>
        {isAddingPlace && newPlaceLocation && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-[1000] glass-panel rounded-t-3xl p-6 shadow-2xl border-t border-[var(--color-sbr-orange)]/30 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Store className="text-[var(--color-sbr-orange)]" /> Add New Place
              </h3>
              <button onClick={() => { setIsAddingPlace(false); setNewPlaceLocation(null); setPhotoPreviews([]); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                  Place Name <span className={newPlaceForm.name ? "text-green-400" : "text-red-400"}>*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newPlaceForm.name}
                    onChange={(e) => setNewPlaceForm({...newPlaceForm, name: e.target.value})}
                    placeholder="e.g. Shoa Supermarket" 
                    className={`w-full bg-black/40 border rounded-xl p-3 text-white focus:outline-none transition-colors ${newPlaceForm.name ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-[var(--color-sbr-orange)]'}`}
                  />
                  {newPlaceForm.name && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select 
                    value={newPlaceForm.category}
                    onChange={(e) => setNewPlaceForm({...newPlaceForm, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-sbr-orange)]"
                  >
                    <option>Shop</option>
                    <option>Pharmacy</option>
                    <option>Hotel</option>
                    <option>Market</option>
                    <option>Service</option>
                    <option>Cafe</option>
                    <option>Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                    Photos (1-3) <span className={photoPreviews.length > 0 ? "text-green-400" : "text-red-400"}>*</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full bg-black/40 border rounded-xl p-3 text-gray-400 flex items-center justify-center gap-2 hover:bg-white/5 overflow-hidden relative transition-colors ${photoPreviews.length > 0 ? 'border-green-500/50' : 'border-white/10'}`}
                  >
                    {photoPreviews.length > 0 ? (
                      <>
                        <div className="absolute inset-0 flex">
                          {photoPreviews.map((preview, i) => (
                            <img key={i} src={preview} alt={`Preview ${i}`} className="flex-1 h-full object-cover opacity-50" />
                          ))}
                        </div>
                        <span className="relative z-10 text-white font-medium text-xs flex items-center gap-1">
                          <CheckCircle size={14} className="text-green-400" /> {photoPreviews.length} Photo{photoPreviews.length > 1 ? 's' : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera size={18} /> <span className="text-xs">Add Photos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                  Address <span className={newPlaceForm.address ? "text-green-400" : "text-red-400"}>*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newPlaceForm.address}
                    onChange={(e) => setNewPlaceForm({...newPlaceForm, address: e.target.value})}
                    placeholder="Street name, area..." 
                    className={`w-full bg-black/40 border rounded-xl p-3 text-white focus:outline-none transition-colors ${newPlaceForm.address ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-[var(--color-sbr-orange)]'}`}
                  />
                  {newPlaceForm.address && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                  Description / Notes <span className={newPlaceForm.notes ? "text-green-400" : "text-red-400"}>*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newPlaceForm.notes}
                    onChange={(e) => setNewPlaceForm({...newPlaceForm, notes: e.target.value})}
                    placeholder="What makes this place special?" 
                    className={`w-full bg-black/40 border rounded-xl p-3 text-white focus:outline-none transition-colors ${newPlaceForm.notes ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-[var(--color-sbr-orange)]'}`}
                  />
                  {newPlaceForm.notes && <CheckCircle size={16} className="absolute right-3 top-3.5 text-green-500" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Products/Services (Optional)</label>
                  <input 
                    type="text" 
                    value={newPlaceForm.products}
                    onChange={(e) => setNewPlaceForm({...newPlaceForm, products: e.target.value})}
                    placeholder="e.g. Coffee, Pastries" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-sbr-orange)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opening Hours (Optional)</label>
                  <input 
                    type="text" 
                    value={newPlaceForm.openingHours}
                    onChange={(e) => setNewPlaceForm({...newPlaceForm, openingHours: e.target.value})}
                    placeholder="e.g. 8 AM - 8 PM" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-sbr-orange)]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={submitNewPlace}
                  disabled={!newPlaceForm.name || !newPlaceForm.address || !newPlaceForm.notes || photoPreviews.length === 0}
                  className="w-full bg-gradient-to-r from-[var(--color-sbr-orange)] to-orange-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(255,106,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                  Submit Contribution (+10 SBR)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Place Details Bottom Sheet */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-4 left-4 right-4 z-[1000] glass-panel rounded-2xl p-5 shadow-2xl border border-white/10"
          >
            <button 
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-white/10">
                {selectedPlace.photos && selectedPlace.photos.length > 0 ? (
                  <img src={selectedPlace.photos[0]} alt="Place" className="w-full h-full object-cover" />
                ) : (
                  <Store size={32} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
                  {selectedPlace.verified ? (
                    <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                      <CheckCircle size={10} /> Verified
                    </span>
                  ) : (
                    <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/30">Pending</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{selectedPlace.category} • {selectedPlace.address}</p>
                
                {selectedPlace.products && selectedPlace.products.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPlace.products.slice(0, 3).map((p, i) => (
                      <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-300">
                        {p.name}
                      </span>
                    ))}
                    {selectedPlace.products.length > 3 && <span className="text-[10px] text-gray-500">+{selectedPlace.products.length - 3} more</span>}
                  </div>
                )}

                <div className="mt-5 flex gap-3">
                  {activeLayer === 'runner' && selectedPlace.verified ? (
                    <button 
                      onClick={() => handleSendRunner(selectedPlace)}
                      className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                    >
                      <Bike size={18} /> Send Runner
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartVerification(selectedPlace)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(255,106,0,0.4)] transition-all flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={18} /> Verify Details
                    </button>
                  )}
                  <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Navigation size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Details Bottom Sheet */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-4 left-4 right-4 z-[1000] glass-panel rounded-2xl p-5 shadow-2xl border border-[var(--color-sbr-orange)]/30"
          >
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-sbr-orange)]/20 flex items-center justify-center text-[var(--color-sbr-orange)] shrink-0">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{selectedTask.title}</h3>
                  {selectedTask.isGuestPreview && user.isGuest && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Guest Preview</span>
                  )}
                  {selectedTask.isPremium && (
                    <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400" /> Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-1">{selectedTask.placeName}</p>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{selectedTask.description}</p>
                
                <div className="flex items-center gap-3 mt-4">
                  <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="text-xs text-gray-400">Reward:</span>
                    <span className="font-bold text-[var(--color-sbr-orange)]">+{selectedTask.reward} SBR</span>
                  </div>
                  <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="text-xs text-gray-400">Type:</span>
                    <span className="text-xs font-medium capitalize">{selectedTask.type.replace('_', ' ')}</span>
                  </div>
                </div>

                {selectedTask.verificationRequirements && selectedTask.verificationRequirements.length > 0 && (
                  <div className="mt-4 bg-black/40 p-3 rounded-lg border border-white/10">
                    <h4 className="text-xs font-bold text-gray-300 mb-2">Verification Requirements:</h4>
                    <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                      {selectedTask.verificationRequirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 flex gap-3">
                  <button 
                    onClick={() => handleStartVerification({
                      id: selectedTask.id,
                      name: selectedTask.placeName,
                      category: selectedTask.type,
                      address: 'Location from map',
                      location: selectedTask.location
                    })}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={18} /> Start Verification
                  </button>
                  <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Navigation size={20} />
                  </button>
                </div>
                {user.isGuest && !selectedTask.isGuestPreview && selectedTask.status === 'available' && (
                  <p className="text-xs text-center text-gray-400 mt-3">
                    <button onClick={signUp} className="text-[var(--color-sbr-orange)] underline">Sign up</button> to complete this task and earn real SBR.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Form Bottom Sheet */}
      <AnimatePresence>
        {isVerifying && verifyingPlace && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-[1000] glass-panel rounded-t-3xl p-6 shadow-2xl border-t border-blue-500/30 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <CheckCircle className="text-blue-400" /> Verify Place
              </h3>
              <button onClick={() => { setIsVerifying(false); setVerifyingPlace(null); setPhotoPreviews([]); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
              <h4 className="font-bold text-sm text-blue-400">{verifyingPlace.name}</h4>
              <p className="text-xs text-gray-400 mt-1">{verifyingPlace.category} • {verifyingPlace.address}</p>
              
              {selectedTask && selectedTask.id === verifyingPlace.id && selectedTask.verificationRequirements && selectedTask.verificationRequirements.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <h5 className="text-xs font-bold text-blue-300 mb-1">Required to Verify:</h5>
                  <ul className="list-disc list-inside text-xs text-blue-200/80 space-y-1">
                    {selectedTask.verificationRequirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price / Cost</label>
                  <input 
                    type="text" 
                    value={verificationForm.price}
                    onChange={(e) => setVerificationForm({...verificationForm, price: e.target.value})}
                    placeholder="e.g. 50 ETB" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Availability</label>
                  <select 
                    value={verificationForm.availability}
                    onChange={(e) => setVerificationForm({...verificationForm, availability: e.target.value as any})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option>Available</option>
                    <option>Not Available</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Stock Quantity (Optional)</label>
                  <input 
                    type="number" 
                    value={verificationForm.stockQuantity}
                    onChange={(e) => setVerificationForm({...verificationForm, stockQuantity: e.target.value})}
                    placeholder="e.g. 10" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opening Hours</label>
                  <input 
                    type="text" 
                    value={verificationForm.openingHours}
                    onChange={(e) => setVerificationForm({...verificationForm, openingHours: e.target.value})}
                    placeholder="e.g. 8 AM - 6 PM" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Photos (1-3) <span className="text-red-400">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full bg-black/40 border rounded-xl p-4 text-gray-400 flex flex-col items-center justify-center gap-2 hover:bg-white/5 overflow-hidden relative transition-colors ${photoPreviews.length > 0 ? 'border-green-500/50' : 'border-white/10'}`}
                >
                  {photoPreviews.length > 0 ? (
                    <>
                      <div className="absolute inset-0 flex">
                        {photoPreviews.map((preview, i) => (
                          <img key={i} src={preview} alt={`Preview ${i}`} className="flex-1 h-full object-cover opacity-50" />
                        ))}
                      </div>
                      <span className="relative z-10 text-white font-medium text-sm flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" /> {photoPreviews.length} Photos Added
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera size={24} /> <span className="text-xs">Take Photos of Place/Products</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes / Observations</label>
                <textarea 
                  value={verificationForm.notes}
                  onChange={(e) => setVerificationForm({...verificationForm, notes: e.target.value})}
                  placeholder="Any additional details..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl space-y-3">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-400 mt-0.5" />
                  <p className="text-[10px] text-gray-400">Confirm location by dragging the blue marker on the map to the exact spot.</p>
                </div>
                <button 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((position) => {
                        setVerificationLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        });
                      });
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-medium text-blue-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation size={14} /> Use My Current Location
                </button>
              </div>

              <div className="pt-2">
                <button 
                  onClick={submitVerificationForm}
                  disabled={photoPreviews.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Submit Verification (+5 SBR)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Runner Request Form Overlay */}
      <AnimatePresence>
        {showRunnerForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-blue-500/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Bike size={24} />
                  </div>
                  <h3 className="font-bold text-xl">Runner Link</h3>
                </div>
                <button onClick={() => setShowRunnerForm(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Pickup Location</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-300 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-400" />
                    <span className="truncate">{runnerForm.pickup}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Dropoff Destination</label>
                  <input 
                    type="text" 
                    value={runnerForm.dropoff}
                    onChange={(e) => setRunnerForm({...runnerForm, dropoff: e.target.value})}
                    placeholder="Enter delivery address..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Items to Deliver</label>
                  <textarea 
                    value={runnerForm.items}
                    onChange={(e) => setRunnerForm({...runnerForm, items: e.target.value})}
                    placeholder="What should the runner pick up?" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'express', 'scheduled'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setRunnerForm({...runnerForm, urgency: type})}
                      className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        runnerForm.urgency === type 
                          ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={submitRunnerRequest}
                  disabled={!runnerForm.dropoff || !runnerForm.items}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-4 flex items-center justify-center gap-2"
                >
                  <Navigation size={18} /> Request Runner Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

