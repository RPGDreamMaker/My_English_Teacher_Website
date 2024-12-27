import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Class = Database['public']['Tables']['classes']['Row'];

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClass: Class) => void;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onClassCreated,
}: CreateClassModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError('');
    setIsLoading(true);

    try {
      const { data, error: createError } = await supabase
        .from('classes')
        .insert([
          {
            name,
            description,
            teacher_id: user.id,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      onClassCreated(data);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError('Failed to create class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Class">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Class Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Mathematics 101"
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
            {isLoading ? 'Creating...' : 'Create Class'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}