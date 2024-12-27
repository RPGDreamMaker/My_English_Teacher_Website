import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWheelStore } from '../stores/wheel';
import Header from '../components/layout/Header';
import ActivitySelector from '../components/wheel/ActivitySelector';
import Wheel from '../components/wheel/Wheel';
import WinnerModal from '../components/wheel/WinnerModal';
import StudentList from '../components/wheel/StudentList';
import SelectedStudents from '../components/wheel/SelectedStudents';
import { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

export default function WheelOfNamesPage() {
  const { classId } = useParams<{ classId: string }>();
  const [winner, setWinner] = useState<Student | null>(null);
  const {
    activities,
    selectedActivityId,
    students,
    availableStudents,
    selectedStudents,
    absentees,
    infiniteMode,
    initialize,
    createActivity,
    updateActivity,
    deleteActivity,
    selectActivity,
    selectStudent,
    returnStudent,
    returnAllStudents,
    toggleAttendance,
    setInfiniteMode,
  } = useWheelStore();

  useEffect(() => {
    if (!classId) return;
    initialize(classId);
  }, [classId, initialize]);

  async function handleWinnerClose() {
    if (winner) {
      await selectStudent(winner.id);
    }
    setWinner(null);
  }

  if (!classId) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header showBackButton />
      <main className="py-8">
        <div className="max-w-[1600px] mx-auto px-4">
          <ActivitySelector
            activities={activities}
            selectedActivityId={selectedActivityId}
            onActivitySelect={selectActivity}
            onActivityCreate={(name) => createActivity(classId, name)}
            onActivityUpdate={updateActivity}
            onActivityDelete={deleteActivity}
          />

          <div className="flex justify-center items-start gap-8">
            <StudentList
              students={students}
              absentees={absentees}
              onToggleAttendance={toggleAttendance}
            />
            
            {availableStudents.length > 0 ? (
              <div className="flex-1 flex justify-center">
                <Wheel
                  students={availableStudents}
                  onSelectStudent={setWinner}
                />
              </div>
            ) : (
              <div className="flex-1 flex justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                  <p className="text-xl font-medium text-gray-700 mb-4">
                    All students have been selected!
                  </p>
                  <button
                    onClick={returnAllStudents}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset Wheel
                  </button>
                </div>
              </div>
            )}

            <SelectedStudents
              students={selectedStudents}
              onReturnStudent={returnStudent}
              onReturnAll={returnAllStudents}
              infiniteMode={infiniteMode}
              onToggleInfiniteMode={() => setInfiniteMode(!infiniteMode)}
            />
          </div>
        </div>
      </main>

      <WinnerModal
        student={winner}
        onClose={handleWinnerClose}
      />
    </div>
  );
}