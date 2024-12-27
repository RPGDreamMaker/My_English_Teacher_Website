import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { hashPin, parseStudentName } from '../lib/utils';
import useRedirectUnauthenticated from '../hooks/useRedirectUnauthenticated';
import Button from '../components/ui/Button';
import AddStudentModal from '../components/students/AddStudentModal';
import StudentList from '../components/students/StudentList';
import StudentFileUpload from '../components/students/StudentFileUpload';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { UserPlus, Trash2 } from 'lucide-react';

type Student = Database['public']['Tables']['students']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];

export default function StudentsManagement() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useRedirectUnauthenticated();
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    // Load class data and students in parallel
    Promise.all([
      // Fetch class data
      supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          setClassData(data);
        }),

      // Fetch students
      supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          setStudents(data || []);
        })
    ]).catch(err => {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    }).finally(() => {
      setIsLoading(false);
    });
  }, [classId]);

  async function handleFileUpload(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const hashedPin = await hashPin('0000');

      const students = lines.map(line => {
        const { lastName, firstName } = parseStudentName(line.trim());
        return {
          class_id: classId,
          last_name: lastName,
          first_name: firstName,
          pin: hashedPin,
        };
      });

      try {
        const { error: insertError } = await supabase
          .from('students')
          .insert(students);

        if (insertError) throw insertError;
        
        // Fetch updated student list
        const { data: updatedStudents, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .order('last_name')
          .order('first_name');

        if (fetchError) throw fetchError;
        setStudents(updatedStudents || []);
      } catch (err) {
        setError('Failed to upload students');
      }
    };

    reader.readAsText(file);
  }

  async function handleResetPin(studentId: string) {
    try {
      const hashedPin = await hashPin('0000');
      const { error: updateError } = await supabase
        .from('students')
        .update({ pin: hashedPin, pin_changed: false })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // Update local state
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, pin_changed: false }
          : student
      ));
    } catch (err) {
      setError('Failed to reset PIN');
    }
  }

  async function handleDeleteStudent(studentId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (deleteError) throw deleteError;

      // Update local state
      setStudents(students.filter(student => student.id !== studentId));
    } catch (err) {
      setError('Failed to delete student');
    }
  }

  async function handleDeleteAllStudents() {
    try {
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('class_id', classId);

      if (deleteError) throw deleteError;

      // Update local state
      setStudents([]);
    } catch (err) {
      setError('Failed to delete all students');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {classData && (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {classData.name} - Students
                  </h1>
                  {classData.description && (
                    <p className="text-gray-600">{classData.description}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add New Student</span>
                </Button>

                <StudentFileUpload onUpload={handleFileUpload} />

                <Button
                  variant="danger"
                  onClick={handleDeleteAllStudents}
                  className="flex items-center space-x-2"
                  disabled={students.length === 0}
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Remove All Students</span>
                </Button>
              </div>

              {students.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center text-gray-600">
                    No students in this class yet.
                  </div>
                </div>
              ) : (
                <StudentList
                  students={students}
                  onResetPin={handleResetPin}
                  onDeleteStudent={handleDeleteStudent}
                  onStudentUpdated={(updatedStudent) => {
                    setStudents(students.map(student =>
                      student.id === updatedStudent.id ? updatedStudent : student
                    ));
                  }}
                />
              )}

              <AddStudentModal
                classId={classId}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onStudentAdded={(newStudent) => {
                  setStudents([...students, newStudent].sort((a, b) => 
                    a.last_name.localeCompare(b.last_name) || 
                    a.first_name.localeCompare(b.first_name)
                  ));
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}