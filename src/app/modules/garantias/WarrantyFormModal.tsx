import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { WarrantyClaim, ClaimItem } from './types';
import { getResidenciales, getResidentes } from './service';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { ClaimItemForm } from './ClaimItemForm';

interface WarrantyFormModalProps {
  onClose: () => void;
  onSubmit: (warranty: WarrantyClaim) => void;
}

export function WarrantyFormModal({ onClose, onSubmit }: WarrantyFormModalProps) {
  const [residencialId, setResidencialId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [residentId, setResidentId] = useState('');
  const [claims, setClaims] = useState<Omit<ClaimItem, 'id'>[]>([
    {
      claimType: '' as any,
      location: '' as any,
      description: '',
      files: [],
    },
  ]);

  const [residenciales, setResidenciales] = useState<{ id: string; nombre: string }[]>([]);
  const [residentes, setResidentes] = useState<{ id: string; nombre: string; apellido: string; telefono: string; unidad: string | null; residencial_id: string | null }[]>([]);

  useEffect(() => {
    getResidenciales().then(setResidenciales);
    getResidentes().then(setResidentes);
  }, []);

  const selectedResidencial = residenciales.find((r) => r.id === residencialId);
  const filteredResidentes = residencialId
    ? residentes.filter((r) => r.residencial_id === residencialId)
    : residentes;
  const selectedResident = residentes.find((r) => r.id === residentId);

  const handleClaimChange = (index: number, updatedClaim: Omit<ClaimItem, 'id'>) => {
    const newClaims = [...claims];
    newClaims[index] = updatedClaim;
    setClaims(newClaims);
  };

  const handleAddClaim = () => {
    setClaims([
      ...claims,
      {
        claimType: '' as any,
        location: '' as any,
        description: '',
        files: [],
      },
    ]);
  };

  const handleRemoveClaim = (index: number) => {
    setClaims(claims.filter((_, i) => i !== index));
  };

  const canSubmit =
    residencialId &&
    unitNumber &&
    residentId &&
    claims.every((c) => c.claimType && c.location && c.description.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;

    const claimsWithIds: ClaimItem[] = claims.map((claim, index) => ({
      ...claim,
      id: `claim-${Date.now()}-${index}`,
    }));

    const hasUrgentIssues = claims.some(
      (c) => c.claimType === 'leak' || c.claimType === 'electrical'
    );

    const residentName = selectedResident
      ? `${selectedResident.nombre} ${selectedResident.apellido || ''}`.trim()
      : '';

    const warranty: WarrantyClaim = {
      id: `war-${Date.now()}`,
      claimNumber: `GAR-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      residencialId,
      residencialName: selectedResidencial?.nombre || '',
      unitNumber,
      residentId,
      residentName,
      residentPhone: selectedResident?.telefono || '',
      claims: claimsWithIds,
      status: 'pending',
      priority: hasUrgentIssues ? 'high' : claims.length > 2 ? 'medium' : 'low',
      submittedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: `h-${Date.now()}`,
          status: 'pending',
          timestamp: new Date().toISOString(),
          changedBy: 'Sistema',
          notes: 'Reclamo creado',
        },
      ],
    };

    onSubmit(warranty);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nueva Gestion de Garantia</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete la informacion y agregue todos los problemas a reportar
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Informacion de la Unidad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Residencial"
                value={residencialId}
                onChange={(e) => {
                  setResidencialId(e.target.value);
                  setUnitNumber('');
                  setResidentId('');
                }}
                required
              >
                <option value="">Seleccione</option>
                {residenciales.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </Select>

              <Input
                label="Unidad"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Ej: Apto 101"
                required
              />

              <Select
                label="Residente"
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                {filteredResidentes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} {r.apellido || ''}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Problemas a Reportar ({claims.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddClaim}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Problema
              </Button>
            </div>

            <div className="space-y-4">
              {claims.map((claim, index) => (
                <ClaimItemForm
                  key={index}
                  claim={claim}
                  index={index}
                  onChange={(updatedClaim) => handleClaimChange(index, updatedClaim)}
                  onRemove={() => handleRemoveClaim(index)}
                  canRemove={claims.length > 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {claims.length} {claims.length === 1 ? 'problema' : 'problemas'} agregados
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Enviar Reclamo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
