import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSeatingStore } from '../stores/seating';
import Header from '../components/layout/Header';
import SeatingGrid from '../components/seating/SeatingGrid';
import ActivitySelector from '../components/seating/ActivitySelector';
import UnassignedStudents from '../components/seating/UnassignedStudents';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { Layout } from 'lucide-react';

export default function SeatingPlanPage() {
  const { classId } = useParams<{ classId: string }>();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { initialize, seatingPlan, createSeatingPlan } = useSeatingStore();

  useEffect(() => {
    if (!classId) return;

    setIsLoading(true);
    setError(null);

    initialize(classId)
      .catch((err) => {
        console.error('Failed to initialize seating:', err);
        setError('Failed to load seating plan data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [classId, initialize]);

  async function handleCreateSeatingPlan() {
    if (!classId) return;
    
    setError(null);
    try {
      await createSeatingPlan(classId, 6, 10); // Changed from 5 to 6 rows
    } catch (err) {
      console.error('Failed to create seating plan:', err);
      setError('Failed to create seating plan');
    }
  }

  if (!classId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">
              Invalid class ID
            </div>
          </div>
        </main>
      </div>
    );
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
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          ) : !seatingPlan ? (
            <div className="text-center py-12">
              <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Seating Plan
              </h3>
              <p className="text-gray-500 mb-4">
                Create a seating plan to start arranging your students.
              </p>
              <Button onClick={handleCreateSeatingPlan}>
                Create Seating Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <ActivitySelector
                classId={classId}
                selectedActivityId={selectedActivityId}
                onActivitySelect={setSelectedActivityId}
              />
              
              <SeatingGrid 
                selectedActivityId={selectedActivityId}
              />
              
              <UnassignedStudents 
                selectedActivityId={selectedActivityId}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}