import React from 'react';
import { Trash2 } from 'lucide-react';
import { ClaimItem } from './types';
import { CLAIM_TYPE_LABELS, LOCATION_LABELS } from './constants';
import { Select } from '../../../components/ui/Select';
import { MediaUpload } from './MediaUpload';
import { Button } from '../../../components/ui/Button';

interface ClaimItemFormProps {
  claim: Omit<ClaimItem, 'id'>;
  index: number;
  onChange: (claim: Omit<ClaimItem, 'id'>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ClaimItemForm({ claim, index, onChange, onRemove, canRemove }: ClaimItemFormProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white relative">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Reclamo #{index + 1}
        </h4>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="Tipo de Problema"
          value={claim.claimType}
          onChange={(e) => onChange({ ...claim, claimType: e.target.value as any })}
          required
        >
          <option value="">Seleccione un tipo</option>
          {Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          label="Ubicación del Problema"
          value={claim.location}
          onChange={(e) => onChange({ ...claim, location: e.target.value as any })}
          required
        >
          <option value="">Seleccione una ubicación</option>
          {Object.entries(LOCATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción del Problema
          </label>
          <textarea
            value={claim.description}
            onChange={(e) => onChange({ ...claim, description: e.target.value })}
            placeholder="Describe detalladamente el problema..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            required
          />
        </div>

        <MediaUpload
          files={claim.files}
          onChange={(files) => onChange({ ...claim, files })}
        />
      </div>
    </div>
  );
}
