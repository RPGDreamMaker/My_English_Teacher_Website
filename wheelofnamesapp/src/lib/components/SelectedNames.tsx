import React from 'react';
import { ArrowLeftCircle, RotateCcw } from 'lucide-react';

export interface SelectedNamesProps {
  names: string[];
  onReturnName: (name: string) => void;
  onReturnAll?: () => void;
}

export const SelectedNames: React.FC<SelectedNamesProps> = ({ names, onReturnName, onReturnAll }) => {
  if (names.length === 0) return null;

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Selected Names</h2>
        <button
          onClick={onReturnAll}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Return All
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {names.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">{name}</span>
            <button
              onClick={() => onReturnName(name)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Return to wheel"
            >
              <ArrowLeftCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};