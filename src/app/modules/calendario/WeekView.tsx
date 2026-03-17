import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { EventTooltip } from './EventTooltip';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
}

export function WeekView({ events, currentDate }: WeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  const getEventStyle = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const startPosition = (startHour * 60 + startMinute) / (24 * 60) * 100;
    const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / (24 * 60) * 100;

    return {
      top: `${startPosition}%`,
      height: `${Math.max(duration, 3)}%`,
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

  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)]">
            <div className="bg-gray-50 border-r border-b border-gray-200" />
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`border-r border-b border-gray-200 p-2 text-center ${
                  isToday(day) ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs text-gray-600">
                  {day.toLocaleDateString('es-MX', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[60px_repeat(7,1fr)]">
            <div className="bg-gray-50 border-r border-gray-200">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-200 px-1 py-1 text-xs text-gray-600 text-right"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={dayIndex} className="relative border-r border-gray-200">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b border-gray-200"
                    />
                  ))}

                  <div className="absolute inset-0 pointer-events-none px-0.5">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-white text-xs cursor-pointer transition-colors pointer-events-auto overflow-hidden ${getEventColor(event.type)}`}
                        style={getEventStyle(event)}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.title}
                      >
                        <p className="font-semibold truncate text-[10px]">{event.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
