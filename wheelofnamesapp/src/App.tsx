import React, { useState } from 'react';
import { Wheel } from './components/Wheel';
import { WinnerModal } from './components/WinnerModal';
import { SelectedNames } from './components/SelectedNames';
import { AttendanceList } from './components/AttendanceList';

const INITIAL_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Edward',
  'Fiona', 'George', 'Hannah', 'Isaac', 'Julia',
  'Kevin', 'Laura', 'Michael', 'Natalie', 'Oliver',
  'Paula', 'Quentin', 'Rachel', 'Samuel', 'Tina',
  'Victor', 'Wendy', 'Xavier', 'Yvonne', 'Zachary',
  'Amelia', 'Benjamin', 'Tuanui', 'Manoa', 'Lyssandro'
];

function App() {
  const [availableNames, setAvailableNames] = useState<string[]>(INITIAL_NAMES);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [absentees, setAbsentees] = useState<Set<string>>(new Set());
  const [infiniteMode, setInfiniteMode] = useState(false);

  const handleNameSelected = (name: string) => {
    setWinner(name);
  };

  const handleWinnerModalClose = () => {
    if (winner && !infiniteMode) {
      setAvailableNames(prevNames => prevNames.filter(n => n !== winner));
      setSelectedNames(prevNames => [...prevNames, winner]);
    }
    setWinner(null);
  };

  const handleReturnName = (name: string) => {
    setSelectedNames(prevNames => prevNames.filter(n => n !== name));
    if (!absentees.has(name)) {
      setAvailableNames(prevNames => [...prevNames, name]);
    }
  };

  const handleReturnAll = () => {
    const presentNames = selectedNames.filter(name => !absentees.has(name));
    setAvailableNames(prevNames => [...prevNames, ...presentNames]);
    setSelectedNames([]);
  };

  const handleToggleAttendance = (name: string) => {
    setAbsentees(prevAbsentees => {
      const newAbsentees = new Set(prevAbsentees);
      const isCurrentlyAbsent = newAbsentees.has(name);
      
      if (isCurrentlyAbsent) {
        newAbsentees.delete(name);
        // If the student is not in selected names, add them back to available names
        if (!selectedNames.includes(name)) {
          setAvailableNames(prevNames => [...prevNames, name]);
        }
      } else {
        newAbsentees.add(name);
        // Remove from available names if marked as absent
        setAvailableNames(prevNames => prevNames.filter(n => n !== name));
      }
      
      return newAbsentees;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Wheel of Names</h1>
      
      <div className="flex justify-center items-start gap-8">
        <AttendanceList
          names={INITIAL_NAMES}
          absentees={absentees}
          onToggleAttendance={handleToggleAttendance}
        />
        
        {availableNames.length > 0 ? (
          <Wheel
            names={availableNames}
            onSelectName={handleNameSelected}
          />
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-xl font-medium text-gray-700 mb-4">
              All names have been selected!
            </p>
            <button
              onClick={handleReturnAll}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Wheel
            </button>
          </div>
        )}

        <SelectedNames
          names={selectedNames}
          onReturnName={handleReturnName}
          onReturnAll={handleReturnAll}
          infiniteMode={infiniteMode}
          onToggleInfiniteMode={() => setInfiniteMode(!infiniteMode)}
        />
      </div>

      <WinnerModal
        winner={winner}
        onClose={handleWinnerModalClose}
      />
    </div>
  );
}

export default App;