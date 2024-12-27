import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { hashPin } from '../../lib/utils';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ChangePinModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePinModal({ studentId, isOpen, onClose }: ChangePinModalProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Verify current PIN
      const { data: student } = await supabase
        .from('students')
        .select('pin')
        .eq('id', studentId)
        .single();

      if (!student) {
        throw new Error('Student not found');
      }

      const currentPinHash = await hashPin(currentPin);
      const newPinHash = await hashPin(newPin);

      const { error: updateError } = await supabase
        .from('students')
        .update({ 
          pin: newPinHash,
          pin_changed: true 
        })
        .eq('id', studentId);

      if (updateError) throw updateError;

      onClose();
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setError('Failed to change PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change PIN">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current PIN"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          required
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter current PIN"
        />
        <Input
          label="New PIN"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          required
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter new PIN"
        />
        <Input
          label="Confirm New PIN"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          required
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Confirm new PIN"
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
            {isLoading ? 'Changing PIN...' : 'Change PIN'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}