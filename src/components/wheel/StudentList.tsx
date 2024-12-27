import { UserCheck, UserX } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentListProps {
  students: Student[];
  absentees: Set<string>;
  onToggleAttendance: (studentId: string) => void;
}

export default function StudentList({
  students,
  absentees,
  onToggleAttendance,
}: StudentListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-[250px]">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Class List</h2>
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg text-sm"
          >
            <span className={`font-medium ${absentees.has(student.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {student.last_name} {student.first_name}
            </span>
            <button
              onClick={() => onToggleAttendance(student.id)}
              className={`p-0.5 rounded-full transition-colors ${
                absentees.has(student.id) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-green-500 hover:text-green-600'
              }`}
              title={absentees.has(student.id) ? 'Mark as present' : 'Mark as absent'}
            >
              {absentees.has(student.id) ? <UserX size={16} /> : <UserCheck size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}