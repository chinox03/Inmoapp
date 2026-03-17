import React from 'react';
import { X, Calendar, Clock, MapPin, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { CalendarReservation, CommonSpace } from './calendarTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationDetailModalProps {
  reservation: CalendarReservation | null;
  space: CommonSpace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationDetailModal({
  reservation,
  space,
  isOpen,
  onClose,
}: ReservationDetailModalProps) {
  if (!isOpen || !reservation || !space) return null;

  const duration = Math.round(
    (reservation.endTime.getTime() - reservation.startTime.getTime()) / (1000 * 60 * 60)
  );

  const statusConfig = {
    approved: {
      label: 'Aprobada',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    pending: {
      label: 'Pendiente',
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    },
    rejected: {
      label: 'Rechazada',
      icon: X,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
  };

  const status = statusConfig[reservation.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
          <div
            className="h-3 rounded-t-xl"
            style={{ backgroundColor: space.color }}
          />

          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Detalles de Reserva
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {reservation.id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div
                className={`flex items-center justify-between p-3 rounded-lg border ${status.borderColor} ${status.bgColor}`}
              >
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-5 w-5 ${status.textColor}`} />
                  <span className={`font-semibold ${status.textColor}`}>
                    Estado: {status.label}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: space.color }}
                  >
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Espacio</p>
                    <p className="text-lg font-bold text-gray-900">{space.name}</p>
                    <p className="text-sm text-gray-600">{space.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Capacidad: {space.capacity} personas</span>
                      <span>•</span>
                      <span>Horario: {space.availableHours.start} - {space.availableHours.end}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Fecha</p>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {format(reservation.startTime, 'dd MMM yyyy', { locale: es })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {format(reservation.startTime, 'EEEE', { locale: es })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Horario</p>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {format(reservation.startTime, 'HH:mm')} - {format(reservation.endTime, 'HH:mm')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {duration} {duration === 1 ? 'hora' : 'horas'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-500">Residente</p>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {reservation.residentName}
                </p>
              </div>

              {reservation.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Observaciones</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {reservation.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
