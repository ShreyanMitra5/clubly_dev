// Teacher Advisor Booking System Types

export interface Teacher {
  id: string;
  user_id: string;
  email: string;
  name: string;
  school_email?: string;
  max_clubs: number;
  current_clubs_count: number;
  room_number?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  room_number?: string;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvisorRequest {
  id: string;
  club_id: string;
  teacher_id: string;
  student_id: string;
  message?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
  // Joined data
  club_name?: string;
  teacher_name?: string;
  student_name?: string;
}

export interface MeetingBooking {
  id: string;
  club_id: string;
  teacher_id: string;
  student_id: string;
  meeting_date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  room_number?: string;
  purpose?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  // Joined data
  club_name?: string;
  teacher_name?: string;
  student_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'advisor_request' | 'booking_confirmed' | 'booking_cancelled' | 'availability_updated' | 'request_approved' | 'request_denied';
  title: string;
  message: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

export interface TeacherWithAvailability extends Teacher {
  availability: TeacherAvailability[];
}

export interface TeacherWithStats extends Teacher {
  pending_requests: number;
  upcoming_meetings: number;
  total_bookings: number;
}

export interface BookingConflict {
  has_conflict: boolean;
  conflicting_bookings?: MeetingBooking[];
}

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  is_available: boolean;
}

export interface TeacherSearchFilters {
  active_only?: boolean;
  has_availability?: boolean;
  max_clubs_available?: number;
  room_number?: string;
}

export interface BookingRequest {
  club_id: string;
  teacher_id: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  purpose?: string;
}

export interface AdvisorRequestData {
  club_id: string;
  teacher_id: string;
  message?: string;
}

export interface AvailabilityUpdate {
  teacher_id: string;
  availability: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    room_number?: string;
    is_recurring: boolean;
    is_active: boolean;
  }[];
}

// API Response types
export interface TeachersResponse {
  teachers: TeacherWithAvailability[];
  total: number;
}

export interface AdvisorRequestsResponse {
  requests: AdvisorRequest[];
  total: number;
}

export interface MeetingBookingsResponse {
  bookings: MeetingBooking[];
  total: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

// Calendar and scheduling types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  type: 'booking' | 'availability' | 'request';
  data?: MeetingBooking | TeacherAvailability | AdvisorRequest;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  booking?: MeetingBooking;
}

export interface WeeklySchedule {
  [dayOfWeek: number]: TimeSlot[];
}

// Form types
export interface TeacherRegistrationForm {
  name: string;
  email: string;
  school_email?: string;
  room_number?: string;
  max_clubs: number;
}

export interface AvailabilityForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  is_recurring: boolean;
}

export interface BookingForm {
  meeting_date: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  purpose?: string;
} 