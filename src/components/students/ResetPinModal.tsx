import { Database } from '../../lib/database.types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

type Student = Database['public']['Tables']['students']['Row'];

interface ResetPinModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetPinModal({
  student,
  isOpen,
  onClose,
  onConfirm,
}: ResetPinModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Student PIN"
    >
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Do you want to reset the PIN for the following student: {' '}
          <span className="font-semibold">
            {student.last_name} {student.first_name}
          </span>
          ?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          The PIN will be reset to '0000' and the student will need to change it on their next login.
        </p>
      </div>
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Reset PIN
        </Button>
      </div>
    </Modal>
  );
}