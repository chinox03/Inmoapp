import React from 'react';
import { CommonSpace } from './calendarTypes';

interface SpaceLegendProps {
  spaces: CommonSpace[];
}

export function SpaceLegend({ spaces }: SpaceLegendProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Leyenda de Espacios</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {spaces.map((space) => (
          <div key={space.id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: space.color }}
            />
            <span className="text-xs text-gray-700 truncate">{space.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
