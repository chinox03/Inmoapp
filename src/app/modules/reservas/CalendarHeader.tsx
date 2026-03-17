import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { CalendarView } from './calendarTypes';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const getDateRangeText = () => {
    switch (view) {
      case 'day':
      case 'date':
        return format(currentDate, 'EEEE, d MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoy
        </Button>
        <h2 className="text-xl font-bold text-gray-900">{getDateRangeText()}</h2>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={view === 'day' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewChange('day')}
        >
          Día
        </Button>
        <Button
          variant={view === 'week' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewChange('week')}
        >
          Semana
        </Button>
        <Button
          variant={view === 'month' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewChange('month')}
        >
          Mes
        </Button>
      </div>
    </div>
  );
}
