import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { getCalendarEvents } from './service';
import { CalendarEvent, ViewMode, FilterState } from './types';
import { useAuth } from '../../../contexts/AuthContext';

export function CalendarioPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    reservas: true,
    mudanzas: true,
    amonestaciones: true,
    mantenimiento: true,
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const data = await getCalendarEvents(user);
    setEvents(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (event.type === 'reserva' && !filters.reservas) return false;
      if (event.type === 'mudanza' && !filters.mudanzas) return false;
      if (event.type === 'amonestacion' && !filters.amonestaciones) return false;
      if (event.type === 'mantenimiento' && !filters.mantenimiento) return false;
      return true;
    });
  }, [events, filters]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeLabel = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long'
      });
    }
  };

  const toggleFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const countByType = (type: string) => events.filter(e => e.type === type).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendario</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza todos los eventos programados en los residenciales
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadEvents}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 ml-4">
                <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {getDateRangeLabel()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'day' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Dia
              </Button>
              <Button
                variant={viewMode === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mes
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.reservas}
                onChange={() => toggleFilter('reservas')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reservas</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.mudanzas}
                onChange={() => toggleFilter('mudanzas')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mudanzas</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amonestaciones}
                onChange={() => toggleFilter('amonestaciones')}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amonestaciones</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.mantenimiento}
                onChange={() => toggleFilter('mantenimiento')}
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mantenimiento</span>
              </span>
            </label>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {viewMode === 'day' && (
                <DayView events={filteredEvents} currentDate={currentDate} />
              )}
              {viewMode === 'week' && (
                <WeekView events={filteredEvents} currentDate={currentDate} />
              )}
              {viewMode === 'month' && (
                <MonthView events={filteredEvents} currentDate={currentDate} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Estadisticas</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {countByType('reserva')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reservas</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {countByType('mudanza')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mudanzas</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {countByType('amonestacion')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Amonestaciones</p>
            </div>
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {countByType('mantenimiento')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mantenimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
