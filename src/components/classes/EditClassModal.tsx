import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Class = Database['public']['Tables']['classes']['Row'];

interface EditClassModalProps {
  classData: Class;
  isOpen: boolean;
  onClose: () => void;
  onClassUpdated: (updatedClass: Class) => void;
}

export default function EditClassModal({
  classData,
  isOpen,
  onClose,
  onClassUpdated,
}: EditClassModalProps) {
  const [name, setName] = useState(classData.name);
  const [description, setDescription] = useState(classData.description || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('classes')
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq('id', classData.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('No data returned');

      onClassUpdated(data);
      onClose();
    } catch (err) {
      console.error('Failed to update class:', err);
      setError('Failed to update class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Class">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Class Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional class description"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
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