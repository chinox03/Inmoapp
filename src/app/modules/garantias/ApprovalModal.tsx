import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { WarrantyClaim, TeamType, RejectionReason, StatusHistory } from './types';
import { TEAM_LABELS, REJECTION_REASON_LABELS } from './constants';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';

interface ApprovalModalProps {
  warranty: WarrantyClaim;
  onClose: () => void;
  onApprove: (data: { team: TeamType; visitDate: string; notes: string }) => void;
  onReject: (data: { reason: RejectionReason; notes: string }) => void;
}

export function ApprovalModal({ warranty, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [team, setTeam] = useState<TeamType | ''>('');
  const [visitDate, setVisitDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState<RejectionReason | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxNotesLength = 500;

  const canApprove = team && visitDate && notes.trim();
  const canReject = rejectionReason && notes.trim();

  const handleSubmit = async () => {
    if (action === 'approve' && canApprove) {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onApprove({
        team: team as TeamType,
        visitDate,
        notes,
      });
    } else if (action === 'reject' && canReject) {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onReject({
        reason: rejectionReason as RejectionReason,
        notes,
      });
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Revisar Reclamo
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {warranty.claimNumber} - {warranty.residentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Información del Reclamo
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Residencial:</span>
                <p className="font-medium text-gray-900">{warranty.residencialName}</p>
              </div>
              <div>
                <span className="text-gray-600">Unidad:</span>
                <p className="font-medium text-gray-900">{warranty.unitNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <p className="font-medium text-gray-900">{warranty.residentPhone}</p>
              </div>
              <div>
                <span className="text-gray-600">Problemas:</span>
                <p className="font-medium text-gray-900">{warranty.claims.length} reportados</p>
              </div>
            </div>
          </div>

          {!action && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Seleccione una acción para continuar:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAction('approve')}
                  className="flex items-center justify-center space-x-2 p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-green-700">Aprobar</span>
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className="flex items-center justify-center space-x-2 p-4 border-2 border-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="font-semibold text-red-700">Rechazar</span>
                </button>
              </div>
            </div>
          )}

          {action === 'approve' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-green-900">
                    Aprobar Reclamo
                  </h3>
                </div>
                <p className="text-sm text-green-800">
                  Complete la información para asignar el ticket al equipo correspondiente.
                </p>
              </div>

              <Select
                label="Equipo Asignado"
                value={team}
                onChange={(e) => setTeam(e.target.value as TeamType)}
                required
              >
                <option value="">Seleccione un equipo</option>
                {Object.entries(TEAM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <Input
                label="Fecha de Visita Programada"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={minDate}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    if (e.target.value.length <= maxNotesLength) {
                      setNotes(e.target.value);
                    }
                  }}
                  placeholder="Instrucciones para el equipo asignado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Campo obligatorio</p>
                  <p className={`text-xs ${notes.length > maxNotesLength * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
                    {notes.length}/{maxNotesLength}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setAction(null);
                  setTeam('');
                  setVisitDate('');
                  setNotes('');
                }}
                className="w-full"
              >
                Cancelar Aprobación
              </Button>
            </div>
          )}

          {action === 'reject' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h3 className="text-sm font-semibold text-red-900">
                    Rechazar Reclamo
                  </h3>
                </div>
                <p className="text-sm text-red-800">
                  Indique el motivo del rechazo y agregue observaciones para el residente.
                </p>
              </div>

              <Select
                label="Motivo de Rechazo"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
                required
              >
                <option value="">Seleccione un motivo</option>
                {Object.entries(REJECTION_REASON_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    if (e.target.value.length <= maxNotesLength) {
                      setNotes(e.target.value);
                    }
                  }}
                  placeholder="Explique el motivo del rechazo al residente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Campo obligatorio</p>
                  <p className={`text-xs ${notes.length > maxNotesLength * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
                    {notes.length}/{maxNotesLength}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setAction(null);
                  setRejectionReason('');
                  setNotes('');
                }}
                className="w-full"
              >
                Cancelar Rechazo
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cerrar
          </Button>
          {action && (
            <Button
              variant={action === 'approve' ? 'primary' : 'primary'}
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (action === 'approve' && !canApprove) ||
                (action === 'reject' && !canReject)
              }
              className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isSubmitting ? (
                'Procesando...'
              ) : action === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar y Asignar
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmar Rechazo
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
