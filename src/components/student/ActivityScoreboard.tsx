import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Trophy, BarChart2 } from 'lucide-react';
import LoadingSpinner from '../layout/LoadingSpinner';
import Button from '../ui/Button';
import ActivityScoreboardModal from './ActivityScoreboardModal';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityPoints = Database['public']['Tables']['activity_points']['Row'];

interface ActivityScoreboardProps {
  classId: string;
  studentId: string;
}

export default function ActivityScoreboard({ classId, studentId }: ActivityScoreboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [points, setPoints] = useState<ActivityPoints[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    async function loadActivities() {
      try {
        // Fetch activities for the class
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('class_id', classId)
          .order('created_at', { ascending: false });

        if (activitiesError) throw activitiesError;

        setActivities(activitiesData || []);

        // Fetch points for all activities
        if (activitiesData && activitiesData.length > 0) {
          const { data: pointsData, error: pointsError } = await supabase
            .from('activity_points')
            .select('*')
            .eq('student_id', studentId)
            .in('activity_id', activitiesData.map(a => a.id));

          if (pointsError) throw pointsError;
          setPoints(pointsData || []);
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
        setError('Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();
  }, [classId, studentId]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          No activities available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          On-going Class Activities Scoreboard
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Activities
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Score
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => {
              const pointRecord = points.find(p => p.activity_id === activity.id);
              return (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-blue-600">
                    {pointRecord?.points || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedActivity(activity)}
                      className="inline-flex items-center gap-2"
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span>View Rankings</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedActivity && (
        <ActivityScoreboardModal
          activityId={selectedActivity.id}
          activityName={selectedActivity.name}
          isOpen={true}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}