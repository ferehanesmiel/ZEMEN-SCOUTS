import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, Task, Contribution } from '../context/AppContext';
import { MapPin, Navigation, CheckCircle, X, Plus, Store, Camera, Image as ImageIcon, Star } from 'lucide-react';

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
  const { tasks, completeTask, contributions, addContribution, user, signUp } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [center, setCenter] = useState({ lat: 9.0227, lng: 38.7468 }); // Addis Ababa
  
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceLocation, setNewPlaceLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newPlaceForm, setNewPlaceForm] = useState({ name: '', category: 'Shop', address: '', notes: '', products: '', openingHours: '' });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const submitNewPlace = () => {
    if (!newPlaceLocation || !newPlaceForm.name) return;
    
    addContribution({
      name: newPlaceForm.name,
      category: newPlaceForm.category,
      address: newPlaceForm.address || 'Unknown Address',
      notes: newPlaceForm.notes,
      products: newPlaceForm.products,
      openingHours: newPlaceForm.openingHours,
      location: newPlaceLocation,
      reward: 10, // Base reward for adding a place
      photoUrls: photoPreviews.length > 0 ? photoPreviews : undefined
    });
    
    setIsAddingPlace(false);
    setNewPlaceLocation(null);
    setNewPlaceForm({ name: '', category: 'Shop', address: '', notes: '', products: '', openingHours: '' });
    setPhotoPreviews([]);
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

        {tasks.map((task) => (
          <Marker 
            key={task.id} 
            position={[task.location.lat, task.location.lng]}
            icon={task.status === 'completed' ? createAnimatedIcon('bg-green-500', false, getCategoryIcon(task.type)) : customIcon}
            eventHandlers={{
              click: () => {
                setSelectedTask(task);
                setSelectedContribution(null);
                setCenter(task.location);
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="font-bold text-black">{task.placeName}</div>
              <div className="text-xs text-gray-600">{task.title}</div>
            </Popup>
          </Marker>
        ))}

        {contributions.map((contrib) => (
          <Marker 
            key={contrib.id} 
            position={[contrib.location.lat, contrib.location.lng]}
            icon={contrib.status === 'pending' ? pendingIcon : createAnimatedIcon('bg-green-500', false, getCategoryIcon(contrib.category))}
            eventHandlers={{
              click: () => {
                setSelectedContribution(contrib);
                setSelectedTask(null);
                setCenter(contrib.location);
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="font-bold text-black">{contrib.name}</div>
              <div className="text-xs text-gray-600">{contrib.status === 'pending' ? 'Pending Verification' : 'Verified Place'}</div>
            </Popup>
          </Marker>
        ))}

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

        <RecenterMap lat={center.lat} lng={center.lng} />
      </MapContainer>

      {/* Floating Add Place Button */}
      {!isAddingPlace && !selectedTask && !selectedContribution && (
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

                <div className="mt-5 flex gap-3">
                  {selectedTask.status === 'available' ? (
                    <button 
                      onClick={() => {
                        completeTask(selectedTask.id);
                        setSelectedTask(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-[var(--color-sbr-orange)] to-orange-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(255,106,0,0.4)] hover:shadow-[0_0_25px_rgba(255,106,0,0.6)] transition-all flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={18} /> Complete Task
                    </button>
                  ) : (
                    <button disabled className="flex-1 bg-green-500/20 text-green-400 font-bold py-3 rounded-xl border border-green-500/30 flex justify-center items-center gap-2">
                      <CheckCircle size={18} /> Completed
                    </button>
                  )}
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

      {/* Contribution Details Bottom Sheet */}
      <AnimatePresence>
        {selectedContribution && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-4 left-4 right-4 z-[1000] glass-panel rounded-2xl p-5 shadow-2xl border border-gray-500/30"
          >
            <button 
              onClick={() => setSelectedContribution(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                {selectedContribution.photoUrls && selectedContribution.photoUrls.length > 0 ? (
                  <img src={selectedContribution.photoUrls[0]} alt="Place" className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{selectedContribution.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selectedContribution.status === 'pending' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {selectedContribution.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{selectedContribution.category}</p>
                {selectedContribution.notes && <p className="text-xs text-gray-400 mt-2">{selectedContribution.notes}</p>}
                
                <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400">Reward upon verification:</p>
                  <p className="font-bold text-[var(--color-sbr-orange)]">+{selectedContribution.reward} SBR</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

