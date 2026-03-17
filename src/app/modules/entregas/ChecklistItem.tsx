import React from 'react';
import { CheckItem, CheckItemStatus } from './types';
import { Check, X, AlertCircle } from 'lucide-react';

interface ChecklistItemProps {
  item: CheckItem;
  onChange: (item: CheckItem) => void;
}

export function ChecklistItem({ item, onChange }: ChecklistItemProps) {
  const handleStatusChange = (status: CheckItemStatus) => {
    onChange({ ...item, status });
  };

  const handleObservationsChange = (observations: string) => {
    onChange({ ...item, observations });
  };

  const getButtonClasses = (buttonStatus: CheckItemStatus) => {
    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors';
    if (item.status === buttonStatus) {
      if (buttonStatus === 'compliant') {
        return `${baseClasses} bg-green-600 text-white`;
      } else if (buttonStatus === 'non_compliant') {
        return `${baseClasses} bg-red-600 text-white`;
      } else {
        return `${baseClasses} bg-yellow-600 text-white`;
      }
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleStatusChange('compliant')}
            className={getButtonClasses('compliant')}
          >
            <Check className="h-4 w-4 inline mr-1" />
            Cumple
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('non_compliant')}
            className={getButtonClasses('non_compliant')}
          >
            <X className="h-4 w-4 inline mr-1" />
            No Cumple
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('with_observations')}
            className={getButtonClasses('with_observations')}
          >
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Con Observaciones
          </button>
        </div>
      </div>

      {(item.status === 'with_observations' || item.status === 'non_compliant') && (
        <div className="mt-3">
          <textarea
            value={item.observations}
            onChange={(e) => handleObservationsChange(e.target.value)}
            placeholder="Escribe tus observaciones aquí..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
