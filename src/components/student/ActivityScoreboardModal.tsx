import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Trophy } from 'lucide-react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../layout/LoadingSpinner';

type Student = Database['public']['Tables']['students']['Row'];
type ActivityPoints = Database['public']['Tables']['activity_points']['Row'];

interface StudentScore {
  student: Student;
  points: number;
}

interface ActivityScoreboardModalProps {
  activityId: string;
  activityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityScoreboardModal({
  activityId,
  activityName,
  isOpen,
  onClose,
}: ActivityScoreboardModalProps) {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScores() {
      if (!isOpen) return;
      
      try {
        // Get all points for this activity
        const { data: points, error: pointsError } = await supabase
          .from('activity_points')
          .select('*, student:students(*)')
          .eq('activity_id', activityId)
          .order('points', { ascending: false });

        if (pointsError) throw pointsError;

        // Get all students in the class to include those with 0 points
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', (points?.[0]?.student as Student)?.class_id);

        if (studentsError) throw studentsError;

        // Combine and sort scores
        const allScores: StudentScore[] = students.map(student => ({
          student,
          points: points?.find(p => p.student_id === student.id)?.points || 0
        })).sort((a, b) => b.points - a.points);

        setScores(allScores);
      } catch (err) {
        console.error('Failed to load scores:', err);
        setError('Failed to load scoreboard');
      } finally {
        setIsLoading(false);
      }
    }

    loadScores();
  }, [activityId, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Class Scoreboard - ${activityName}`}
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scores.map((score, index) => (
                <tr key={score.student.id} className={index === 0 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && (
                        <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <span className={`
                        font-medium
                        ${index === 0 ? 'text-yellow-600' : 'text-gray-900'}
                      `}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {score.student.last_name} {score.student.first_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-mono font-bold text-blue-600">
                      {score.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}