import { FormEvent, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Database } from '../../lib/database.types';

type Activity = Database['public']['Tables']['activities']['Row'];

interface EditActivityModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityId: string, newName: string) => Promise<void>;
}

export default function EditActivityModal({
  activity,
  isOpen,
  onClose,
  onSave,
}: EditActivityModalProps) {
  const [name, setName] = useState(activity.name);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      await onSave(activity.id, name.trim());
      onClose();
    } catch (err) {
      setError('Failed to update activity name');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Activity">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Activity Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          required
        />
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}