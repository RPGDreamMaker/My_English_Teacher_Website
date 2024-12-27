import { ArrowLeftCircle, RotateCcw, Repeat } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

interface SelectedStudentsProps {
  students: Student[];
  onReturnStudent: (studentId: string) => void;
  onReturnAll: () => void;
  infiniteMode: boolean;
  onToggleInfiniteMode: () => void;
}

export default function SelectedStudents({ 
  students, 
  onReturnStudent, 
  onReturnAll,
  infiniteMode,
  onToggleInfiniteMode
}: SelectedStudentsProps) {
  return (
    <div className="flex-none bg-white rounded-lg shadow-md p-4" style={{ width: '200px' }}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-800">Selected</h2>
        <div className="flex gap-1">
          <button
            onClick={onToggleInfiniteMode}
            className={`flex items-center transition-colors p-0.5 rounded-full ${
              infiniteMode 
                ? 'text-purple-600 hover:text-purple-700' 
                : 'text-gray-400 hover:text-gray-500'
            }`}
            title={infiniteMode ? 'Disable infinite mode' : 'Enable infinite mode'}
          >
            <Repeat size={16} />
          </button>
          {students.length > 0 && (
            <button
              onClick={onReturnAll}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors p-0.5 rounded-full"
              title="Return all students to wheel"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1 max-h-[600px] overflow-y-auto text-sm">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {infiniteMode 
              ? 'Infinite mode: Names stay in wheel' 
              : 'No students selected yet'}
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700 truncate max-w-[170px]">
                {student.first_name}
              </span>
              <button
                onClick={() => onReturnStudent(student.id)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-0.5 rounded-full flex-shrink-0 ml-2"
                title="Return to wheel"
              >
                <ArrowLeftCircle size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}