import { useState } from 'react';
import { Trash2, RefreshCw, Pencil } from 'lucide-react';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import EditActivityModal from './EditActivityModal';
import { useSeatingStore } from '../../stores/seating';
import { Database } from '../../lib/database.types';

type Activity = Database['public']['Tables']['activities']['Row'];

interface ActivityActionsProps {
  activityId: string | null;
  onActivityDeleted: () => void;
}

export default function ActivityActions({ activityId, onActivityDeleted }: ActivityActionsProps) {
  const { deleteActivity, resetActivityScores, updateActivity, activities } = useSeatingStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!activityId) return null;

  const activity = activities.find(a => a.id === activityId);
  if (!activity) return null;

  async function handleDelete() {
    try {
      await deleteActivity(activityId);
      onActivityDeleted();
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert('Failed to delete activity');
    }
  }

  async function handleReset() {
    try {
      await resetActivityScores(activityId);
    } catch (error) {
      console.error('Failed to reset scores:', error);
      alert('Failed to reset scores');
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsResetDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset Scores</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          <span>Edit Name</span>
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Activity</span>
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Reset Scores"
        message="Are you sure you want to reset all scores for this activity? This action cannot be undone."
        confirmLabel="Reset"
        variant="warning"
      />

      <EditActivityModal
        activity={activity}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateActivity}
      />
    </>
  );
}