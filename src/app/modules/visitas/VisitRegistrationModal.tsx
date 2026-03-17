import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DocumentUpload } from './DocumentUpload';
import { ResidentSearch } from './ResidentSearch';
import { OCRResult, VisitFormData, Resident } from './types';

interface VisitRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VisitFormData) => void;
}

export function VisitRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
}: VisitRegistrationModalProps) {
  const [formData, setFormData] = useState<VisitFormData>({
    visitorFirstName: '',
    visitorLastName: '',
    visitorDocumentNumber: '',
    residentId: '',
    residentName: '',
    unitNumber: '',
    residencialName: '',
    visitPurpose: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VisitFormData, string>>>({});
  const [ocrCompleted, setOcrCompleted] = useState(false);

  const handleOCRComplete = (result: OCRResult) => {
    setFormData((prev) => ({
      ...prev,
      visitorFirstName: result.firstName,
      visitorLastName: result.lastName,
      visitorDocumentNumber: result.documentNumber,
    }));
    setOcrCompleted(true);
    setErrors({});
  };

  const handleChange = (field: keyof VisitFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleResidentSelect = (resident: Resident | null) => {
    if (resident) {
      setFormData((prev) => ({
        ...prev,
        residentId: resident.id,
        residentName: resident.name,
        unitNumber: resident.unitNumber,
        residencialName: resident.residencialName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        residentId: '',
        residentName: '',
        unitNumber: '',
        residencialName: '',
      }));
    }
    if (errors.residentId) {
      setErrors((prev) => ({ ...prev, residentId: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VisitFormData, string>> = {};

    if (!formData.visitorFirstName.trim()) {
      newErrors.visitorFirstName = 'El nombre es requerido';
    }
    if (!formData.visitorLastName.trim()) {
      newErrors.visitorLastName = 'El apellido es requerido';
    }
    if (!formData.visitorDocumentNumber.trim()) {
      newErrors.visitorDocumentNumber = 'El numero de documento es requerido';
    }
    if (!formData.residentId) {
      newErrors.residentId = 'Debe seleccionar un residente';
    }
    if (!formData.visitPurpose.trim()) {
      newErrors.visitPurpose = 'El motivo de visita es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      visitorFirstName: '',
      visitorLastName: '',
      visitorDocumentNumber: '',
      residentId: '',
      residentName: '',
      unitNumber: '',
      residencialName: '',
      visitPurpose: '',
    });
    setErrors({});
    setOcrCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">
              Registrar Nueva Visita
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                1. Cargar documento de identificacion
              </label>
              <DocumentUpload onOCRComplete={handleOCRComplete} />
            </div>

            {ocrCompleted && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    2. Verificar informacion del visitante
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      value={formData.visitorFirstName}
                      onChange={(e) =>
                        handleChange('visitorFirstName', e.target.value)
                      }
                      error={errors.visitorFirstName}
                      required
                    />
                    <Input
                      label="Apellido"
                      value={formData.visitorLastName}
                      onChange={(e) =>
                        handleChange('visitorLastName', e.target.value)
                      }
                      error={errors.visitorLastName}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Numero de documento"
                      value={formData.visitorDocumentNumber}
                      onChange={(e) =>
                        handleChange('visitorDocumentNumber', e.target.value)
                      }
                      error={errors.visitorDocumentNumber}
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    3. Seleccionar residente a visitar
                  </label>
                  <ResidentSearch
                    value={formData.residentId}
                    onChange={handleResidentSelect}
                    error={errors.residentId}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    4. Motivo de la visita
                  </label>
                  <select
                    value={formData.visitPurpose}
                    onChange={(e) => handleChange('visitPurpose', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.visitPurpose ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar motivo...</option>
                    <option value="Visita familiar">Visita familiar</option>
                    <option value="Visita social">Visita social</option>
                    <option value="Entrega de paquete">Entrega de paquete</option>
                    <option value="Servicio de mensajeria">
                      Servicio de mensajeria
                    </option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Reparacion">Reparacion</option>
                    <option value="Reunion de negocios">Reunion de negocios</option>
                    <option value="Proveedor de servicios">
                      Proveedor de servicios
                    </option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.visitPurpose && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.visitPurpose}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={!ocrCompleted}
              >
                Registrar Visita
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
