import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

interface AttendanceListProps {
  names: string[];
  absentees: Set<string>;
  onToggleAttendance: (name: string) => void;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  names,
  absentees,
  onToggleAttendance,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-[300px]">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Class List</h2>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {names.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <span className={`font-medium ${absentees.has(name) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {name}
            </span>
            <button
              onClick={() => onToggleAttendance(name)}
              className={`p-1 rounded-full transition-colors ${
                absentees.has(name) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-green-500 hover:text-green-600'
              }`}
              title={absentees.has(name) ? 'Mark as present' : 'Mark as absent'}
            >
              {absentees.has(name) ? <UserX size={20} /> : <UserCheck size={20} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}