import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { CheckItem, Delivery, Ticket, TicketPendingItem, UploadedFile } from './types';
import { getResidenciales, getResidentes } from './service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ChecklistItem } from './ChecklistItem';
import { PhotoUpload } from './PhotoUpload';
import { SignaturePad } from './SignaturePad';

const DEFAULT_CHECKLIST_ITEMS: Omit<CheckItem, 'id'>[] = [
  { label: 'Zocalos', status: null, observations: '' },
  { label: 'Gabinetes', status: null, observations: '' },
  { label: 'Pintura', status: null, observations: '' },
  { label: 'Puertas', status: null, observations: '' },
  { label: 'Tomas de corriente', status: null, observations: '' },
  { label: 'Presion de agua', status: null, observations: '' },
  { label: 'Agua caliente', status: null, observations: '' },
  { label: 'Agua fria', status: null, observations: '' },
];

interface DeliveryFormModalProps {
  onClose: () => void;
  onSubmit: (delivery: Delivery, ticket?: Ticket) => void;
}

export function DeliveryFormModal({ onClose, onSubmit }: DeliveryFormModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [residencialId, setResidencialId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [residentId, setResidentId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [checklistItems, setChecklistItems] = useState<CheckItem[]>(
    DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
      ...item,
      id: `ci-${index}`,
    }))
  );
  const [customItem, setCustomItem] = useState('');
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [generalObservations, setGeneralObservations] = useState('');

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

  const handleChecklistItemChange = (updatedItem: CheckItem) => {
    setChecklistItems(
      checklistItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      const newItem: CheckItem = {
        id: `ci-custom-${Date.now()}`,
        label: customItem.trim(),
        status: null,
        observations: '',
      };
      setChecklistItems([...checklistItems, newItem]);
      setCustomItem('');
    }
  };

  const removeCustomItem = (itemId: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== itemId));
  };

  const isCustomItem = (itemId: string) => itemId.startsWith('ci-custom-');

  const canProceedToStep2 = residencialId && unitNumber && residentId && deliveryDate;
  const canProceedToStep3 = checklistItems.every((item) => item.status !== null);
  const canSubmit = signature !== null;

  const hasIssues = checklistItems.some(
    (item) => item.status === 'non_compliant' || item.status === 'with_observations'
  );

  const handleSubmit = () => {
    if (!canSubmit) return;

    const residentName = selectedResident
      ? `${selectedResident.nombre} ${selectedResident.apellido || ''}`.trim()
      : '';

    const deliveryId = `del-${Date.now()}`;
    const delivery: Delivery = {
      id: deliveryId,
      residencialId,
      residencialName: selectedResidencial?.nombre || '',
      unitNumber,
      residentId,
      residentName,
      deliveryDate,
      checklistItems,
      photos,
      signature,
      generalObservations,
      status: hasIssues ? 'with_issues' : 'completed',
      createdAt: new Date().toISOString(),
      createdBy: '',
    };

    let ticket: Ticket | undefined;

    if (hasIssues) {
      const pendingItems: TicketPendingItem[] = checklistItems
        .filter((item) => item.status === 'non_compliant' || item.status === 'with_observations')
        .map((item) => ({
          id: item.id,
          titulo: item.label,
          categoria: item.status === 'non_compliant' ? 'No conforme' : 'Con observaciones',
          razon: item.observations || '',
          resuelto: false,
        }));

      const highPriorityCount = checklistItems.filter(
        (item) => item.status === 'non_compliant'
      ).length;

      ticket = {
        id: '',
        deliveryId: delivery.id,
        unitNumber,
        residencialName: selectedResidencial?.nombre || '',
        residentName,
        status: 'open',
        priority: highPriorityCount > 0 ? 'high' : 'medium',
        pendingItems,
        createdAt: new Date().toISOString(),
      };
    }

    onSubmit(delivery, ticket);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nueva Entrega de Unidad</h2>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Paso 1: Informacion Basica
              </h3>

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
                <option value="">Seleccione un residencial</option>
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
                placeholder="Ej: Apto 101, Casa 12"
                required
              />

              <Select
                label="Residente / Nuevo Propietario"
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                required
              >
                <option value="">Seleccione un residente</option>
                {filteredResidentes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} {r.apellido || ''}
                  </option>
                ))}
              </Select>

              <Input
                label="Fecha y Hora de Entrega"
                type="datetime-local"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Paso 2: Lista de Verificacion
              </h3>

              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="relative">
                    <ChecklistItem item={item} onChange={handleChecklistItemChange} />
                    {isCustomItem(item.id) && (
                      <button
                        type="button"
                        onClick={() => removeCustomItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Input
                  placeholder="Agregar elemento personalizado..."
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomItem}
                  disabled={!customItem.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Paso 3: Documentacion y Firma
              </h3>

              <PhotoUpload photos={photos} onChange={setPhotos} />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones Generales
                </label>
                <textarea
                  value={generalObservations}
                  onChange={(e) => setGeneralObservations(e.target.value)}
                  placeholder="Escribe cualquier observacion adicional sobre la entrega..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <SignaturePad value={signature} onChange={setSignature} />

              {!signature && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    La firma digital del cliente es requerida para completar la entrega.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                Anterior
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {step < 3 ? (
              <Button
                variant="primary"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                Completar Entrega
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
