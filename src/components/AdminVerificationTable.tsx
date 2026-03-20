import React from 'react';
import { useAppContext } from '../context/AppContext';

export const AdminVerificationTable: React.FC = () => {
  const { verifications, approveSubmission } = useAppContext();

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Task Submissions</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10">
            <th className="p-2">Place</th>
            <th className="p-2">Availability</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map(v => (
            <tr key={v.id} className="border-b border-white/10">
              <td className="p-2">{v.placeName}</td>
              <td className="p-2">{v.availability}</td>
              <td className="p-2">{v.status}</td>
              <td className="p-2">
                {v.status === 'pending' && (
                  <button onClick={() => approveSubmission(v.id)} className="px-4 py-1 bg-green-500 rounded font-bold">Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
