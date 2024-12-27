import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../contexts/StudentAuthContext';
import StudentHeader from '../components/layout/StudentHeader';
import ActivityScoreboard from '../components/student/ActivityScoreboard';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { session } = useStudentAuth();

  useEffect(() => {
    if (!session) {
      navigate('/studentportal');
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <ActivityScoreboard
            classId={session.class.id}
            studentId={session.student.id}
          />
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-500">
              Class materials and learning activities will be available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}