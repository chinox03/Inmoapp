import React, { useState } from 'react';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';
import { CalendarView as CalendarViewType, CalendarReservation, CommonSpace } from './calendarTypes';
import { COMMON_SPACES, MOCK_RESERVATIONS } from './calendarMockData';
import { CalendarHeader } from './CalendarHeader';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { BookingModal, BookingData } from './BookingModal';
import { ReservationDetailModal } from './ReservationDetailModal';
import { SpaceLegend } from './SpaceLegend';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/Toast';

export function CalendarView() {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('week');
  const [selectedSpace, setSelectedSpace] = useState<CommonSpace | null>(null);
  const [reservations, setReservations] = useState<CalendarReservation[]>(MOCK_RESERVATIONS);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<CalendarReservation | null>(null);
  const [bookingPreset, setBookingPreset] = useState<{
    date?: Date;
    hour?: number;
  }>({});

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, view === 'week' ? 7 : 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, view === 'week' ? 7 : 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSpaceChange = (spaceId: string) => {
    if (spaceId === 'all') {
      setSelectedSpace(null);
    } else {
      const space = COMMON_SPACES.find((s) => s.id === spaceId);
      setSelectedSpace(space || null);
    }
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setBookingPreset({ date, hour });
    setIsBookingModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const handleReservationClick = (reservation: CalendarReservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReservation(null);
  };

  const handleBookingSubmit = (bookingData: BookingData) => {
    const space = COMMON_SPACES.find((s) => s.id === bookingData.spaceId);
    if (!space) return;

    const [year, month, day] = bookingData.date.split('-').map(Number);
    const [startHour, startMinute] = bookingData.startTime.split(':').map(Number);
    const [endHour, endMinute] = bookingData.endTime.split(':').map(Number);

    const startTime = new Date(year, month - 1, day, startHour, startMinute);
    const endTime = new Date(year, month - 1, day, endHour, endMinute);

    const newReservation: CalendarReservation = {
      id: `res-${Date.now()}`,
      spaceId: bookingData.spaceId,
      spaceName: space.name,
      residentName: bookingData.residentName,
      startTime,
      endTime,
      status: 'pending',
      notes: bookingData.notes,
    };

    setReservations([...reservations, newReservation]);
    showToast('Reserva creada exitosamente', 'success');
    setBookingPreset({});
  };

  const filteredReservations = selectedSpace
    ? reservations.filter((r) => r.spaceId === selectedSpace.id)
    : reservations;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-64">
          <Select
            value={selectedSpace?.id || 'all'}
            onChange={(e) => handleSpaceChange(e.target.value)}
            className="w-full"
          >
            <option value="all">Todos los Espacios</option>
            {COMMON_SPACES.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setView}
      />

      <SpaceLegend spaces={COMMON_SPACES} />

      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          reservations={filteredReservations}
          selectedSpace={selectedSpace}
          spaces={COMMON_SPACES}
          onTimeSlotClick={handleTimeSlotClick}
          onReservationClick={handleReservationClick}
        />
      )}

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          reservations={filteredReservations}
          selectedSpace={selectedSpace}
          spaces={COMMON_SPACES}
          onTimeSlotClick={handleTimeSlotClick}
          onReservationClick={handleReservationClick}
        />
      )}

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          reservations={filteredReservations}
          selectedSpace={selectedSpace}
          spaces={COMMON_SPACES}
          onDateClick={handleDateClick}
          onReservationClick={handleReservationClick}
        />
      )}

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingPreset({});
        }}
        onSubmit={handleBookingSubmit}
        spaces={COMMON_SPACES}
        selectedSpace={selectedSpace}
        preselectedDate={bookingPreset.date}
        preselectedHour={bookingPreset.hour}
      />

      <ReservationDetailModal
        reservation={selectedReservation}
        space={
          selectedReservation
            ? COMMON_SPACES.find((s) => s.id === selectedReservation.spaceId) || null
            : null
        }
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
