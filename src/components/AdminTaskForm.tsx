import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task } from '../context/AppContext';

export const AdminTaskForm: React.FC = () => {
  const { createTask } = useAppContext();
  const [task, setTask] = useState<Omit<Task, 'id' | 'status' | 'created_at'>>({
    title: '',
    description: '',
    reward: 10,
    type: 'price_check',
    location: { lat: 0, lng: 0 },
    placeName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask(task);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4">
      <h2 className="text-xl font-bold">Create New Task</h2>
      <input type="text" placeholder="Task Title" value={task.title} onChange={e => setTask({...task, title: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
      <textarea placeholder="Description" value={task.description} onChange={e => setTask({...task, description: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
      <input type="number" placeholder="Reward (SBR)" value={task.reward} onChange={e => setTask({...task, reward: Number(e.target.value)})} className="w-full p-2 rounded bg-white/5 border border-white/10" required />
      <select value={task.type} onChange={e => setTask({...task, type: e.target.value as any})} className="w-full p-2 rounded bg-white/5 border border-white/10">
        <option value="price_check">Price Check</option>
        <option value="availability">Availability</option>
        <option value="photo_verification">Photo Verification</option>
        <option value="location_check">Location Check</option>
      </select>
      <button type="submit" className="w-full py-2 bg-orange-500 rounded font-bold">Create Task</button>
    </form>
  );
};
