import { useEffect } from 'react';
import { Database } from '../../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface WinnerModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function WinnerModal({ student, onClose }: WinnerModalProps) {
  useEffect(() => {
    if (student) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    }
  }, [student]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-24 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-center mb-2 mt-8">We have a winner!</h2>
          <p className="text-4xl font-bold text-center text-blue-600 mb-6">{student.first_name}</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}