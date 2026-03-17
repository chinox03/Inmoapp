import React from 'react';
import { CalendarReservation, CommonSpace } from './calendarTypes';
import { format, isSameDay, isWithinInterval } from 'date-fns';

interface DayViewProps {
  currentDate: Date;
  reservations: CalendarReservation[];
  selectedSpace: CommonSpace | null;
  spaces: CommonSpace[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onReservationClick: (reservation: CalendarReservation) => void;
}

export function DayView({
  currentDate,
  reservations,
  selectedSpace,
  spaces,
  onTimeSlotClick,
  onReservationClick,
}: DayViewProps) {
  const getSpaceColor = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space?.color || '#3B82F6';
  };
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getReservationsForHour = (hour: number) => {
    return reservations.filter((res) => {
      if (selectedSpace && res.spaceId !== selectedSpace.id) return false;

      const slotStart = new Date(currentDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(currentDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      return (
        isSameDay(res.startTime, currentDate) &&
        (isWithinInterval(slotStart, { start: res.startTime, end: res.endTime }) ||
          isWithinInterval(res.startTime, { start: slotStart, end: slotEnd }))
      );
    });
  };

  const isSlotAvailable = (hour: number) => {
    const reservationsInSlot = getReservationsForHour(hour);
    return reservationsInSlot.length === 0;
  };

  const handleSlotClick = (hour: number) => {
    if (isSlotAvailable(hour)) {
      onTimeSlotClick(currentDate, hour);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-1">
          {hours.map((hour) => {
            const reservationsInSlot = getReservationsForHour(hour);
            const isAvailable = reservationsInSlot.length === 0;

            return (
              <div
                key={hour}
                className={`border-b border-gray-100 min-h-[60px] p-3 transition-colors ${
                  isAvailable
                    ? 'hover:bg-blue-50 cursor-pointer'
                    : 'bg-gray-50'
                }`}
                onClick={() => handleSlotClick(hour)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {format(new Date().setHours(hour, 0), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    {reservationsInSlot.length === 0 ? (
                      <div className="text-sm text-gray-400 italic">Disponible</div>
                    ) : (
                      reservationsInSlot.map((res) => (
                        <div
                          key={res.id}
                          className="bg-white border-l-4 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          style={{ borderLeftColor: getSpaceColor(res.spaceId) }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReservationClick(res);
                          }}
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {res.spaceName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {format(res.startTime, 'HH:mm')} - {format(res.endTime, 'HH:mm')}
                          </div>
                          <div className="text-xs text-gray-500">{res.residentName}</div>
                          {res.notes && (
                            <div className="text-xs text-gray-500 mt-1 truncate">{res.notes}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
