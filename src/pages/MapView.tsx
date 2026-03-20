import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, Task } from '../context/AppContext';
import { MapPin, Navigation, CheckCircle, X } from 'lucide-react';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const completedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

export default function MapView() {
  const { tasks, completeTask } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [center, setCenter] = useState({ lat: 9.0227, lng: 38.7468 }); // Addis Ababa

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
        
        {tasks.map((task) => (
          <Marker 
            key={task.id} 
            position={[task.location.lat, task.location.lng]}
            icon={task.status === 'completed' ? completedIcon : customIcon}
            eventHandlers={{
              click: () => {
                setSelectedTask(task);
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
        <RecenterMap lat={center.lat} lng={center.lng} />
      </MapContainer>

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
                <h3 className="font-bold text-lg">{selectedTask.title}</h3>
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
