export interface CommonSpace {
  id: string;
  name: string;
  description: string;
  capacity: number;
  color: string;
  availableHours: {
    start: string;
    end: string;
  };
}

export interface CalendarReservation {
  id: string;
  spaceId: string;
  spaceName: string;
  residentName: string;
  startTime: Date;
  endTime: Date;
  status: 'approved' | 'pending' | 'rejected';
  notes?: string;
}

export type CalendarView = 'day' | 'week' | 'month' | 'date';

export interface TimeSlot {
  time: string;
  hour: number;
  isAvailable: boolean;
  reservations: CalendarReservation[];
}
