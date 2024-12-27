import { useState } from 'react';
import { useSeatingStore } from '../../stores/seating';
import StudentCard from './StudentCard';
import { Grid, Move } from 'lucide-react';

interface SeatingGridProps {
  selectedActivityId: string | null;
}

export default function SeatingGrid({ selectedActivityId }: SeatingGridProps) {
  const { seatingPlan, seats, updateSeat } = useSeatingStore();
  const [isDragging, setIsDragging] = useState(false);

  if (!seatingPlan) return null;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(10, minmax(0, 1fr))`,
    gap: '0.5rem',
  };

  function handleDragOver(e: React.DragEvent, isOccupied: boolean) {
    e.preventDefault();
    e.dataTransfer.dropEffect = isOccupied ? 'none' : 'move';
  }

  function handleDrop(e: React.DragEvent, row: number, col: number) {
    e.preventDefault();
    setIsDragging(false);
    
    const isOccupied = seats.some(s => s.row_num === row && s.col_num === col);
    if (isOccupied) return;

    const studentId = e.dataTransfer.getData('text/plain');
    if (studentId) {
      updateSeat(studentId, row, col);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Grid className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Seating Arrangement</h2>
      </div>
      
      <div style={gridStyle}>
        {Array.from({ length: 60 }).map((_, index) => {
          const row = Math.floor(index / 10);
          const col = index % 10;
          const seat = seats.find(s => s.row_num === row && s.col_num === col);
          const isOccupied = Boolean(seat);

          return (
            <div
              key={`${row}-${col}`}
              className={`
                aspect-square border-2 rounded-lg p-2
                ${seat ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
                ${isDragging && isOccupied ? 'cursor-no-drop' : 'hover:border-blue-400'}
                transition-colors
              `}
              onDragOver={(e) => handleDragOver(e, isOccupied)}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, row, col)}
            >
              {seat ? (
                <StudentCard
                  studentId={seat.student_id}
                  activityId={selectedActivityId}
                  isDraggable
                  onDragStart={() => setIsDragging(true)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Move className="h-6 w-6" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}