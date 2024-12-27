import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface WinnerModalProps {
  winner: string | null;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  useEffect(() => {
    if (winner) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-4">We have a winner!</h2>
        <p className="text-4xl font-bold text-center text-blue-600">{winner}</p>
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};