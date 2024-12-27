import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { LogOut, ChevronLeft, Settings } from 'lucide-react';
import TeacherSettingsModal from './TeacherSettingsModal';

interface HeaderProps {
  showBackButton?: boolean;
}

export default function Header({ showBackButton }: HeaderProps) {
  const { user, displayName, signOut, updateDisplayName } = useAuth();
  const navigate = useNavigate();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/teacherportal');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link
                to="/teacherportal/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {displayName || user?.email}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <TeacherSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentDisplayName={displayName}
        onDisplayNameSave={updateDisplayName}
      />
    </header>
  );
}