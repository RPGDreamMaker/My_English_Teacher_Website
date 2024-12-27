import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { formatStudentName } from '../../lib/utils';
import Button from '../ui/Button';
import ChangePinModal from '../student/ChangePinModal';
import { LogOut, Key } from 'lucide-react';

export default function StudentHeader() {
  const navigate = useNavigate();
  const { session, setSession } = useStudentAuth();
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

  function handleSignOut() {
    setSession(null);
    navigate('/studentportal');
  }

  if (!session) return null;

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {formatStudentName(session.student.last_name, session.student.first_name)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {session.class.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsChangePinModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>Change PIN</span>
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

      <ChangePinModal
        studentId={session.student.id}
        isOpen={isChangePinModalOpen}
        onClose={() => setIsChangePinModalOpen(false)}
      />
    </header>
  );
}