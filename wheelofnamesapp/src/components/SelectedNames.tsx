import React from 'react';
import { ArrowLeftCircle, RotateCcw, Repeat } from 'lucide-react';

interface SelectedNamesProps {
  names: string[];
  onReturnName: (name: string) => void;
  onReturnAll?: () => void;
  infiniteMode: boolean;
  onToggleInfiniteMode: () => void;
}

export const SelectedNames: React.FC<SelectedNamesProps> = ({ 
  names, 
  onReturnName, 
  onReturnAll,
  infiniteMode,
  onToggleInfiniteMode
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Selected Names</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleInfiniteMode}
            className={`flex items-center gap-2 transition-colors p-1 rounded-full ${
              infiniteMode 
                ? 'text-purple-600 hover:text-purple-700' 
                : 'text-gray-400 hover:text-gray-500'
            }`}
            title={infiniteMode ? 'Disable infinite mode' : 'Enable infinite mode'}
          >
            <Repeat size={20} />
          </button>
          {names.length > 0 && (
            <button
              onClick={onReturnAll}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors p-1 rounded-full"
              title="Return all names to wheel"
            >
              <RotateCcw size={20} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {names.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {infiniteMode 
              ? 'Infinite mode: Names remain in wheel after selection' 
              : 'No names selected yet'}
          </p>
        ) : (
          names.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700">{name}</span>
              <button
                onClick={() => onReturnName(name)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full"
                title="Return to wheel"
              >
                <ArrowLeftCircle size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}