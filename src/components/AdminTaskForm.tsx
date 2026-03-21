import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { Task } from '../context/AppContext';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }: { position: {lat: number, lng: number}, setPosition: (pos: {lat: number, lng: number}) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([position.lat, position.lng], map.getZoom());
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position.lat !== 0 ? <Marker position={[position.lat, position.lng]} /> : null;
};

export const AdminTaskForm: React.FC = () => {
  const { createTask } = useAppContext();
  const [task, setTask] = useState<Omit<Task, 'id' | 'status' | 'created_at'>>({
    title: '',
    description: '',
    reward: 10,
    type: 'price_check',
    location: { lat: 9.0227, lng: 38.7468 }, // Default to Addis Ababa
    placeName: '',
    verificationRequirements: []
  });
  
  const [coordInput, setCoordInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');

  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordInput(e.target.value);
    const val = e.target.value.trim();
    
    // Try to parse DD.DD, DD.DD
    const parts = val.split(',').map(p => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setTask({ ...task, location: { lat, lng } });
        return;
      }
    }

    // Try to parse DD MM SS format (e.g., 9 1 21.72 N, 38 44 48.48 E)
    // Very basic regex for DMS
    const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+([\d.]+)["\s]*([NS])[\s,]+(\d+)[°\s]+(\d+)['\s]+([\d.]+)["\s]*([EW])/i;
    const match = val.match(dmsRegex);
    if (match) {
      let lat = parseInt(match[1]) + parseInt(match[2])/60 + parseFloat(match[3])/3600;
      if (match[4].toUpperCase() === 'S') lat = -lat;
      
      let lng = parseInt(match[5]) + parseInt(match[6])/60 + parseFloat(match[7])/3600;
      if (match[8].toUpperCase() === 'W') lng = -lng;

      if (!isNaN(lat) && !isNaN(lng)) {
        setTask({ ...task, location: { lat, lng } });
      }
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setTask({
        ...task,
        verificationRequirements: [...(task.verificationRequirements || []), requirementInput.trim()]
      });
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    const newReqs = [...(task.verificationRequirements || [])];
    newReqs.splice(index, 1);
    setTask({ ...task, verificationRequirements: newReqs });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask(task);
    // Reset form
    setTask({
      title: '',
      description: '',
      reward: 10,
      type: 'price_check',
      location: { lat: 9.0227, lng: 38.7468 },
      placeName: '',
      verificationRequirements: []
    });
    setCoordInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4">
      <h2 className="text-xl font-bold">Create New Task</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <input type="text" placeholder="Task Title" value={task.title} onChange={e => setTask({...task, title: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
          <input type="text" placeholder="Place Name" value={task.placeName} onChange={e => setTask({...task, placeName: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
          <textarea placeholder="Description" value={task.description} onChange={e => setTask({...task, description: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
          
          <div className="flex gap-2">
            <input type="number" placeholder="Reward (SBR)" value={task.reward} onChange={e => setTask({...task, reward: Number(e.target.value)})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
            <select value={task.type} onChange={e => setTask({...task, type: e.target.value as any})} className="w-full p-2 rounded bg-white/5 border border-white/10">
              <option value="price_check">Price Check</option>
              <option value="availability">Availability</option>
              <option value="photo_verification">Photo Verification</option>
              <option value="location_check">Location Check</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Verification Requirements (What should scouts verify?)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Check if the shop is open" 
                value={requirementInput} 
                onChange={e => setRequirementInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className="flex-1 p-2 rounded bg-white/5 border border-white/10" 
              />
              <button type="button" onClick={addRequirement} className="px-4 bg-blue-500 rounded font-bold">+</button>
            </div>
            {task.verificationRequirements && task.verificationRequirements.length > 0 && (
              <ul className="space-y-1 mt-2">
                {task.verificationRequirements.map((req, i) => (
                  <li key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-sm">
                    <span>{req}</span>
                    <button type="button" onClick={() => removeRequirement(i)} className="text-red-400 hover:text-red-300">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm text-gray-400">Location (Click on map or enter coordinates)</label>
          <input 
            type="text" 
            placeholder="Coordinates (e.g. 9.0227, 38.7468)" 
            value={coordInput} 
            onChange={handleCoordChange} 
            className="w-full p-2 rounded bg-white/5 border border-white/10" 
          />
          <div className="h-[300px] rounded-xl overflow-hidden border border-white/10">
            <MapContainer center={[task.location.lat, task.location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <LocationPicker 
                position={task.location} 
                setPosition={(pos) => {
                  setTask({...task, location: pos});
                  setCoordInput(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
                }} 
              />
            </MapContainer>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full py-3 bg-orange-500 rounded-xl font-bold mt-4 hover:bg-orange-600 transition-colors">Create Task</button>
    </form>
  );
};
