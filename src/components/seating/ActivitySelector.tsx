import { useState } from 'react';
import { useSeatingStore } from '../../stores/seating';
import { Trophy, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import DownloadScoresButton from './DownloadScoresButton';
import ActivityActions from './ActivityActions';

interface ActivitySelectorProps {
  classId: string;
  selectedActivityId: string | null;
  onActivitySelect: (id: string | null) => void;
}

export default function ActivitySelector({ 
  classId,
  selectedActivityId, 
  onActivitySelect 
}: ActivitySelectorProps) {
  const { activities, createActivity } = useSeatingStore();
  const [newActivityName, setNewActivityName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!newActivityName.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);
    
    try {
      await createActivity(classId, newActivityName.trim());
      setNewActivityName('');
    } catch (err) {
      setError('Failed to create activity');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Trophy className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Activities</h2>
        </div>
        <div className="flex items-center gap-4">
          <ActivityActions 
            activityId={selectedActivityId} 
            onActivityDeleted={() => onActivitySelect(null)} 
          />
          <DownloadScoresButton activityId={selectedActivityId} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* New activity form */}
        <form onSubmit={handleCreateActivity} className="flex gap-2">
          <Input
            placeholder="New activity name..."
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="w-48"
            error={error}
          />
          <Button type="submit" disabled={isCreating}>
            <Plus className="h-5 w-5" />
          </Button>
        </form>

        {activities.map((activity) => (
          <Button
            key={activity.id}
            variant={selectedActivityId === activity.id ? 'primary' : 'secondary'}
            onClick={() => onActivitySelect(
              selectedActivityId === activity.id ? null : activity.id
            )}
          >
            {activity.name}
          </Button>
        ))}
      </div>
    </div>
  );
}