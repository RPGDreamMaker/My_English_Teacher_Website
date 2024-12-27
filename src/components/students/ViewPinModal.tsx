import { Database } from '../../lib/database.types';
import Modal from '../ui/Modal';

type Student = Database['public']['Tables']['students']['Row'];

interface ViewPinModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewPinModal({
  student,
  isOpen,
  onClose,
}: ViewPinModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Student PIN - ${student.last_name} ${student.first_name}`}
    >
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          {student.pin_changed 
            ? 'Student has changed their PIN'
            : 'Current PIN for this student:'}
        </p>
        <p className="text-4xl font-mono font-bold text-gray-900 mb-6">
          {student.pin_changed ? 'Changed' : '0000'}
        </p>
        {student.pin_changed ? (
          <p className="text-sm text-gray-500">
            For security reasons, changed PINs cannot be viewed. You can reset the PIN if needed.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Student should change this default PIN on first login.
          </p>
        )}
      </div>
    </Modal>
  );
}