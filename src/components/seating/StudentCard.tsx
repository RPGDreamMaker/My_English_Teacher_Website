import { useState } from 'react';
import { useSeatingStore } from '../../stores/seating';
import { Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';

interface StudentCardProps {
  studentId: string;
  activityId: string | null;
  isDraggable?: boolean;
  onDragStart?: () => void;
}

export default function StudentCard({ 
  studentId, 
  activityId, 
  isDraggable = false,
  onDragStart 
}: StudentCardProps) {
  const { getStudent, getPoints, updatePoints } = useSeatingStore();
  const [optimisticPoints, setOptimisticPoints] = useState<number | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState(new Set<number>());
  
  const student = getStudent(studentId);
  const serverPoints = activityId ? getPoints(studentId, activityId) : null;
  const points = optimisticPoints ?? serverPoints;

  if (!student) return null;

  async function handlePointChange(change: number) {
    if (!activityId) return;
    
    const updateId = Date.now();
    const newPoints = (points || 0) + change;
    
    // Track this update
    setPendingUpdates(prev => new Set(prev).add(updateId));
    setOptimisticPoints(newPoints);

    try {
      await updatePoints(studentId, activityId, newPoints);
    } catch (error) {
      // On error, only revert if this was the last update
      if (Math.max(...Array.from(pendingUpdates)) === updateId) {
        setOptimisticPoints(serverPoints);
      }
      console.error('Failed to update points:', error);
    } finally {
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updateId);
        if (next.size === 0) {
          // Clear optimistic value only when all updates are done
          setOptimisticPoints(null);
        }
        return next;
      });
    }
  }

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', studentId);
        onDragStart?.();
      }}
      className="h-full flex flex-col justify-between"
    >
      <div className="text-center">
        <div className="font-semibold text-gray-900 text-sm truncate">
          {student.last_name}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {student.first_name}
        </div>
      </div>
      
      {activityId && (
        <div className="mt-2">
          <div className="text-center font-mono font-bold text-lg text-blue-600 mb-1">
            {points || 0}
          </div>
          <div className="flex justify-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handlePointChange(-1)}
              className="p-1"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={() => handlePointChange(1)}
              className="p-1"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}