import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { verifyPin } from '../lib/utils';
import { useStudentAuth } from '../contexts/StudentAuthContext';
import ClassSelect from '../components/student/ClassSelect';
import StudentSelect from '../components/student/StudentSelect';
import ChangePinForm from '../components/student/ChangePinForm';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GraduationCap } from 'lucide-react';

export default function StudentPortal() {
  const navigate = useNavigate();
  const { setSession } = useStudentAuth();
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsPinChange, setNeedsPinChange] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      
      const isValid = await verifyPin(pin, student.pin);
      if (!isValid) {
        setError('Invalid PIN');
        return;
      }

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      setSession({ student, class: classData });

      if (!student.pin_changed) {
        setNeedsPinChange(true);
      } else {
        navigate('/studentportal/dashboard');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (needsPinChange) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <ChangePinForm
              studentId={studentId}
              onPinChanged={() => navigate('/studentportal/dashboard')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-8">
            Student Portal
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ClassSelect
              value={classId}
              onChange={(value) => {
                setClassId(value);
                setStudentId('');
              }}
            />

            <StudentSelect
              classId={classId}
              value={studentId}
              onChange={setStudentId}
            />

            <Input
              label="PIN"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter your 4-digit PIN"
              disabled={!studentId}
            />

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !classId || !studentId || !pin}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}