import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { EventTooltip } from './EventTooltip';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
}

export function MonthView({ events, currentDate }: MonthViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysFromPrevMonth = firstDay.getDay();
    const daysInCurrentMonth = lastDay.getDate();

    const days: Date[] = [];

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push(day);
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getEventsForDay = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
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
    e.stopPropagation();
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setSelectedEvent(event);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const currentMonth = isCurrentMonth(day);
            const today = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                  !currentMonth ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    today
                      ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                      : currentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded text-white cursor-pointer transition-colors truncate ${getEventColor(event.type)}`}
                      onClick={(e) => handleEventClick(event, e)}
                      title={event.title}
                    >
                      <span className="font-medium">{event.startTime}</span> {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-600 px-2 font-medium">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
