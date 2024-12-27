import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { hashPin } from '../../lib/utils';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ChangePinFormProps {
  studentId: string;
  onPinChanged: () => void;
}

export default function ChangePinForm({ studentId, onPinChanged }: ChangePinFormProps) {
  const navigate = useNavigate();
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
      const hashedPin = await hashPin(newPin);
      const { error: updateError } = await supabase
        .from('students')
        .update({ pin: hashedPin, pin_changed: true })
        .eq('id', studentId);

      if (updateError) throw updateError;
      
      onPinChanged();
      navigate('/studentportal/dashboard');
    } catch (err) {
      setError('Failed to change PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Change Your PIN</h2>
      <p className="text-sm text-gray-600">
        Please choose a new 4-digit PIN to access your account.
      </p>
      <Input
        label="New PIN"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        required
        value={newPin}
        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter 4 digits"
      />
      <Input
        label="Confirm PIN"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        required
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter 4 digits"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Changing PIN...' : 'Change PIN'}
      </Button>
    </form>
  );
}