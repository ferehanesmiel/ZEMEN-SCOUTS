import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Verification } from '../context/AppContext';

export const ScoutTaskForm: React.FC<{ taskId: string, placeId: string, placeName: string, reward: number }> = ({ taskId, placeId, placeName, reward }) => {
  const { submitTask } = useAppContext();
  const [submission, setSubmission] = useState<Omit<Verification, 'id' | 'status' | 'date'>>({
    placeId,
    placeName,
    availability: 'Available',
    photoUrls: [],
    location: { lat: 0, lng: 0 },
    submittedBy: '', // This will be handled by the context
    reward,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTask(submission as any);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4">
      <h2 className="text-xl font-bold">Verification for {placeName}</h2>
      <select value={submission.availability} onChange={e => setSubmission({...submission, availability: e.target.value as any})} className="w-full p-2 rounded bg-white/5 border border-white/10">
        <option value="Available">Available</option>
        <option value="Not Available">Not Available</option>
      </select>
      <input type="number" placeholder="Price (optional)" onChange={e => setSubmission({...submission, price: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" />
      <input type="number" placeholder="Stock Quantity (optional)" onChange={e => setSubmission({...submission, stockQuantity: Number(e.target.value)})} className="w-full p-2 rounded bg-white/5 border border-white/10" />
      <textarea placeholder="Notes (optional)" onChange={e => setSubmission({...submission, notes: e.target.value})} className="w-full p-2 rounded bg-white/5 border border-white/10" />
      <button type="submit" className="w-full py-2 bg-green-500 rounded font-bold">Submit Verification</button>
    </form>
  );
};
