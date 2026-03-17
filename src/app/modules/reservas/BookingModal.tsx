import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { CommonSpace } from './calendarTypes';
import { format } from 'date-fns';
import { ResidentSearch, Resident } from './ResidentSearch';
import { supabase } from '../../../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: BookingData) => void;
  spaces: CommonSpace[];
  selectedSpace: CommonSpace | null;
  preselectedDate?: Date;
  preselectedHour?: number;
}

export interface BookingData {
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  residentName: string;
  residentId?: string;
  residentUnit?: string;
  notes?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  onSubmit,
  spaces,
  selectedSpace,
  preselectedDate,
  preselectedHour,
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingData>({
    spaceId: selectedSpace?.id || '',
    date: preselectedDate ? format(preselectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: preselectedHour !== undefined ? `${String(preselectedHour).padStart(2, '0')}:00` : '09:00',
    endTime: preselectedHour !== undefined ? `${String(preselectedHour + 1).padStart(2, '0')}:00` : '10:00',
    residentName: '',
    notes: '',
  });

  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    supabase
      .from('profiles')
      .select('id, nombre, apellido, telefono, unidad')
      .eq('rol', 'RESIDENTE')
      .eq('estado', 'activo')
      .order('nombre')
      .then(({ data }) => {
        if (data) {
          setResidents(
            data.map((r: any) => ({
              id: r.id,
              name: `${r.nombre || ''} ${r.apellido || ''}`.trim(),
              unitNumber: r.unidad || '',
              phone: r.telefono || '',
            }))
          );
        }
      });
  }, [isOpen]);

  const selectedSpaceData = spaces.find((s) => s.id === formData.spaceId);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.spaceId) {
      newErrors.spaceId = 'Seleccione un espacio';
    }
    if (!formData.date) {
      newErrors.date = 'Seleccione una fecha';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Ingrese hora de inicio';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Ingrese hora de fin';
    }
    if (!selectedResident) {
      newErrors.resident = 'Seleccione un residente';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (start >= end) {
        newErrors.endTime = 'La hora de fin debe ser posterior a la de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const bookingData: BookingData = {
        ...formData,
        residentName: selectedResident?.name || '',
        residentId: selectedResident?.id,
        residentUnit: selectedResident?.unitNumber,
      };
      onSubmit(bookingData);
      setSelectedResident(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Reserva</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete los detalles de su reserva
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Espacio Común <span className="text-red-600">*</span>
            </label>
            <Select
              value={formData.spaceId}
              onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
              className="w-full"
            >
              <option value="">Seleccione un espacio</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} - Cap. {space.capacity} personas
                </option>
              ))}
            </Select>
            {errors.spaceId && (
              <p className="text-xs text-red-600 mt-1">{errors.spaceId}</p>
            )}
            {selectedSpaceData && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-4 h-4 rounded mt-0.5"
                    style={{ backgroundColor: selectedSpaceData.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{selectedSpaceData.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>Cap. {selectedSpaceData.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {selectedSpaceData.availableHours.start} -{' '}
                          {selectedSpaceData.availableHours.end}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Fecha <span className="text-red-600">*</span>
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.date && (
              <p className="text-xs text-red-600 mt-1">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Hora de Inicio <span className="text-red-600">*</span>
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              {errors.startTime && (
                <p className="text-xs text-red-600 mt-1">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Hora de Fin <span className="text-red-600">*</span>
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
              {errors.endTime && (
                <p className="text-xs text-red-600 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          <ResidentSearch
            residents={residents}
            selectedResident={selectedResident}
            onSelectResident={setSelectedResident}
            required
            error={errors.resident}
          />

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Propósito de la reserva, cantidad de invitados, etc."
            />
          </div>
        </form>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" onClick={handleSubmit}>
            Confirmar Reserva
          </Button>
        </div>
      </div>
    </div>
  );
}
