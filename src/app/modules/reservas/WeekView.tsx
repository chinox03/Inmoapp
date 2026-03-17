import React from 'react';
import { CalendarReservation, CommonSpace } from './calendarTypes';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isWithinInterval,
  differenceInMinutes,
} from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  reservations: CalendarReservation[];
  selectedSpace: CommonSpace | null;
  spaces: CommonSpace[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onReservationClick: (reservation: CalendarReservation) => void;
}

export function WeekView({
  currentDate,
  reservations,
  selectedSpace,
  spaces,
  onTimeSlotClick,
  onReservationClick,
}: WeekViewProps) {
  const getSpaceColor = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space?.color || '#3B82F6';
  };
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getReservationsForSlot = (day: Date, hour: number) => {
    return reservations.filter((res) => {
      if (selectedSpace && res.spaceId !== selectedSpace.id) return false;

      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      return (
        isSameDay(res.startTime, day) &&
        (isWithinInterval(slotStart, { start: res.startTime, end: res.endTime }) ||
          isWithinInterval(res.startTime, { start: slotStart, end: slotEnd }))
      );
    });
  };

  const isSlotAvailable = (day: Date, hour: number) => {
    return getReservationsForSlot(day, hour).length === 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200">
              Hora
            </div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="p-3 text-center border-r border-gray-200 last:border-r-0"
              >
                <div className="text-xs text-gray-600">{format(day, 'EEE')}</div>
                <div className="text-lg font-semibold text-gray-900">{format(day, 'd')}</div>
              </div>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-2 text-xs text-gray-600 font-medium border-r border-gray-200 flex items-center justify-center bg-gray-50">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
                {weekDays.map((day) => {
                  const reservationsInSlot = getReservationsForSlot(day, hour);
                  const isAvailable = reservationsInSlot.length === 0;

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`p-1 border-r border-gray-100 min-h-[50px] transition-colors ${
                        isAvailable
                          ? 'hover:bg-blue-50 cursor-pointer'
                          : 'bg-gray-50'
                      }`}
                      onClick={() => isAvailable && onTimeSlotClick(day, hour)}
                    >
                      {reservationsInSlot.map((res) => (
                        <div
                          key={res.id}
                          className="text-xs p-1 rounded mb-1 text-white font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: getSpaceColor(res.spaceId) }}
                          title={`${res.spaceName} - ${res.residentName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReservationClick(res);
                          }}
                        >
                          {res.spaceName}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
