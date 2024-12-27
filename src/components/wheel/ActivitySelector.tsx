import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Database } from '../../lib/database.types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import EditActivityModal from './EditActivityModal';

type WheelActivity = Database['public']['Tables']['wheel_activities']['Row'];

interface ActivitySelectorProps {
  activities: WheelActivity[];
  selectedActivityId: string | null;
  onActivitySelect: (activityId: string | null) => void;
  onActivityCreate: (name: string) => void;
  onActivityDelete: (activityId: string) => void;
  onActivityUpdate: (activityId: string, newName: string) => Promise<void>;
}

export default function ActivitySelector({
  activities,
  selectedActivityId,
  onActivitySelect,
  onActivityCreate,
  onActivityDelete,
  onActivityUpdate,
}: ActivitySelectorProps) {
  const [newActivityName, setNewActivityName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<WheelActivity | null>(null);

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!newActivityName.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);
    
    try {
      await onActivityCreate(newActivityName.trim());
      setNewActivityName('');
    } catch (err) {
      setError('Failed to create activity');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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

        {/* Default button */}
        <Button
          variant={selectedActivityId === null ? 'primary' : 'secondary'}
          onClick={() => onActivitySelect(null)}
        >
          Default
        </Button>

        {/* Activity buttons */}
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-1">
            <Button
              variant={selectedActivityId === activity.id ? 'primary' : 'secondary'}
              onClick={() => onActivitySelect(activity.id)}
            >
              {activity.name}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingActivity(activity)}
              className="p-1"
              title="Edit activity name"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onActivityDelete(activity.id)}
              className="p-1"
              title="Delete activity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          onSave={onActivityUpdate}
        />
      )}
    </div>
  );
}