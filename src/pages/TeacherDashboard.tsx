import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import useRedirectUnauthenticated from '../hooks/useRedirectUnauthenticated';
import Button from '../components/ui/Button';
import CreateClassModal from '../components/classes/CreateClassModal';
import ClassCard from '../components/classes/ClassCard';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/layout/LoadingSpinner';

type Class = Database['public']['Tables']['classes']['Row'];

export default function TeacherDashboard() {
  const { user } = useRedirectUnauthenticated();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error('Failed to load classes:', fetchError);
          setError('Failed to load classes');
          return;
        }
        setClasses(data || []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  function handleClassUpdated(updatedClass: Class) {
    setClasses(classes.map(c => 
      c.id === updatedClass.id ? updatedClass : c
    ));
  }

  function handleClassDeleted(classId: string) {
    setClasses(classes.filter(c => c.id !== classId));
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create New Class</span>
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}

              {classes.length === 0 ? (
                <div className="text-center text-gray-600">
                  No classes yet. Create your first class to get started!
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((classData) => (
                    <ClassCard 
                      key={classData.id} 
                      classData={classData}
                      onClassUpdated={handleClassUpdated}
                      onClassDeleted={handleClassDeleted}
                    />
                  ))}
                </div>
              )}

              <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onClassCreated={(newClass) => {
                  setClasses([...classes, newClass]);
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}