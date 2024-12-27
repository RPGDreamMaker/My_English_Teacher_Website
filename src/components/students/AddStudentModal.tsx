import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { hashPin } from '../../lib/utils';
import { Database } from '../../lib/database.types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Student = Database['public']['Tables']['students']['Row'];

interface AddStudentModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: (student: Student) => void;
}

export default function AddStudentModal({
  classId,
  isOpen,
  onClose,
  onStudentAdded,
}: AddStudentModalProps) {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const hashedPin = await hashPin('0000');
      const { data, error: createError } = await supabase
        .from('students')
        .insert([
          {
            class_id: classId,
            last_name: lastName.toUpperCase(),
            first_name: firstName,
            pin: hashedPin,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      if (!data) throw new Error('No data returned');

      onStudentAdded(data);
      onClose();
      setLastName('');
      setFirstName('');
    } catch (err) {
      console.error('Failed to add student:', err);
      setError('Failed to add student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Student">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Last Name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="SMITH"
          className="uppercase"
        />
        <Input
          label="First Name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="John"
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
            {isLoading ? 'Adding...' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}