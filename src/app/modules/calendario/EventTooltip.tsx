import React from 'react';
import { CalendarEvent } from './types';
import { Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';

interface EventTooltipProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EventTooltip({ event, position, onClose }: EventTooltipProps) {
  const getEventColor = () => {
    switch (event.type) {
      case 'reserva':
        return 'border-blue-600 bg-blue-50';
      case 'mudanza':
        return 'border-orange-600 bg-orange-50';
      case 'amonestacion':
        return 'border-red-600 bg-red-50';
      case 'mantenimiento':
        return 'border-gray-600 bg-gray-50';
      default:
        return 'border-gray-600 bg-gray-50';
    }
  };

  const adjustedPosition = {
    left: Math.min(position.x, window.innerWidth - 320),
    top: position.y + 20
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className={`fixed z-50 w-72 rounded-lg border-2 ${getEventColor()} shadow-xl p-4`}
        style={{
          left: `${adjustedPosition.left}px`,
          top: `${adjustedPosition.top}px`,
          maxWidth: '300px'
        }}
      >
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
            <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">
              {event.type === 'reserva' && 'Reserva'}
              {event.type === 'mudanza' && 'Mudanza'}
              {event.type === 'amonestacion' && 'Amonestación'}
              {event.type === 'mantenimiento' && 'Mantenimiento'}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                {new Date(event.date + 'T00:00:00').toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                {event.startTime} - {event.endTime}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{event.details.residencial}</span>
            </div>

            {event.details.espacio && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{event.details.espacio}</span>
              </div>
            )}

            {event.details.personas && (
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{event.details.personas} personas</span>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-600 text-xs">Solicitante:</p>
                <p className="text-gray-900 font-medium">{event.details.solicitante}</p>
              </div>
            </div>

            {event.details.observaciones && (
              <div className="pt-2 border-t border-gray-300">
                <p className="text-gray-600 text-xs mb-1">Observaciones:</p>
                <p className="text-gray-700">{event.details.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
