import React from 'react';
import { CalendarReservation, CommonSpace } from './calendarTypes';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

interface MonthViewProps {
  currentDate: Date;
  reservations: CalendarReservation[];
  selectedSpace: CommonSpace | null;
  spaces: CommonSpace[];
  onDateClick: (date: Date) => void;
  onReservationClick: (reservation: CalendarReservation) => void;
}

export function MonthView({
  currentDate,
  reservations,
  selectedSpace,
  spaces,
  onDateClick,
  onReservationClick,
}: MonthViewProps) {
  const getSpaceColor = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space?.color || '#3B82F6';
  };
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((res) => {
      if (selectedSpace && res.spaceId !== selectedSpace.id) return false;
      return isSameDay(res.startTime, day);
    });
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
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
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[100px] p-2 border-r border-b border-gray-100 transition-colors cursor-pointer ${
                  isCurrentMonth
                    ? 'bg-white hover:bg-blue-50'
                    : 'bg-gray-50 text-gray-400'
                } ${isTodayDate ? 'bg-blue-50' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isTodayDate
                      ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : ''
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayReservations.slice(0, 3).map((res) => (
                    <div
                      key={res.id}
                      className="text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getSpaceColor(res.spaceId) }}
                      title={`${res.spaceName} - ${format(res.startTime, 'HH:mm')}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReservationClick(res);
                      }}
                    >
                      {format(res.startTime, 'HH:mm')} {res.spaceName}
                    </div>
                  ))}
                  {dayReservations.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayReservations.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
