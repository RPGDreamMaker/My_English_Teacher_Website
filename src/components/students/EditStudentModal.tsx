import { FormEvent, useState } from 'react';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Student = Database['public']['Tables']['students']['Row'];

interface EditStudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: (student: Student) => void;
}

export default function EditStudentModal({
  student,
  isOpen,
  onClose,
  onStudentUpdated,
}: EditStudentModalProps) {
  const [lastName, setLastName] = useState(student.last_name);
  const [firstName, setFirstName] = useState(student.first_name);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: updateError } = await supabase
        .from('students')
        .update({
          last_name: lastName.toUpperCase(),
          first_name: firstName,
        })
        .eq('id', student.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('No data returned');

      onStudentUpdated(data);
      onClose();
    } catch (err) {
      console.error('Failed to update student:', err);
      setError('Failed to update student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Last Name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="uppercase"
        />
        <Input
          label="First Name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
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