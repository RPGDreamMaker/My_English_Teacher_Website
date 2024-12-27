import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisplayName: string | null;
  onDisplayNameSave: (name: string) => Promise<void>;
}

export default function TeacherSettingsModal({
  isOpen,
  onClose,
  currentDisplayName,
  onDisplayNameSave,
}: TeacherSettingsModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<{ display?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleDisplayNameSubmit(e: FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || isLoading) return;

    setIsLoading(true);
    setError({});

    try {
      await onDisplayNameSave(displayName.trim());
      setError({});
    } catch (err) {
      setError(prev => ({ ...prev, display: 'Failed to update display name' }));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    if (newPassword !== confirmPassword) {
      setError(prev => ({ ...prev, password: 'New passwords do not match' }));
      return;
    }

    setIsLoading(true);
    setError({});

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError({});
    } catch (err) {
      setError(prev => ({ ...prev, password: 'Failed to update password' }));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Teacher Settings">
      <div className="space-y-8">
        {/* Display Name Section */}
        <form onSubmit={handleDisplayNameSubmit} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Display Name</h3>
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            error={error.display}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Display Name'}
            </Button>
          </div>
        </form>

        {/* Password Section */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error.password}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}