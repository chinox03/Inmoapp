import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { EventTooltip } from './EventTooltip';

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
}

export function DayView({ events, currentDate }: DayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const dateString = currentDate.toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.date === dateString);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventStyle = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const startPosition = (startHour * 60 + startMinute) / (24 * 60) * 100;
    const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / (24 * 60) * 100;

    return {
      top: `${startPosition}%`,
      height: `${duration}%`,
    };
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'reserva':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'mudanza':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'amonestacion':
        return 'bg-red-600 hover:bg-red-700';
      case 'mantenimiento':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setSelectedEvent(event);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr]">
          <div className="bg-gray-50 border-r border-gray-200">
            <div className="h-12 border-b border-gray-200" />
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-gray-200 px-2 py-1 text-xs text-gray-600 text-right"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
              <p className="font-semibold text-gray-900">
                {currentDate.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-200"
                />
              ))}

              <div className="absolute inset-0 pointer-events-none">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`absolute left-1 right-1 rounded px-2 py-1 text-white text-xs cursor-pointer transition-colors pointer-events-auto ${getEventColor(event.type)}`}
                    style={getEventStyle(event)}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <p className="font-semibold truncate">{event.title}</p>
                    <p className="truncate opacity-90">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {dayEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay eventos programados para este día
        </div>
      )}

      {selectedEvent && (
        <EventTooltip
          event={selectedEvent}
          position={tooltipPosition}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
