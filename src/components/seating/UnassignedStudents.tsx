import { Users } from 'lucide-react';
import { useSeatingStore } from '../../stores/seating';
import StudentCard from './StudentCard';

interface UnassignedStudentsProps {
  selectedActivityId: string | null;
}

export default function UnassignedStudents({ selectedActivityId }: UnassignedStudentsProps) {
  const { unassignedStudents, updateSeat } = useSeatingStore();

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('text/plain');
    if (studentId) {
      updateSeat(studentId, null, null);
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-6"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Users className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Unassigned Students</h2>
      </div>

      <div className={`
        grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2
        min-h-[120px] border-2 border-dashed border-gray-200 rounded-lg p-4
      `}>
        {unassignedStudents.length === 0 ? (
          <div className="col-span-full flex items-center justify-center text-gray-500">
            Drag students here to unassign them
          </div>
        ) : (
          unassignedStudents.map((student) => (
            <div
              key={student.id}
              className="aspect-square border-2 border-gray-200 rounded-lg p-2 hover:border-blue-400 transition-colors"
            >
              <StudentCard
                studentId={student.id}
                activityId={selectedActivityId}
                isDraggable
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}