import { API_STATUS, EVENT_NAMES } from "@utils/constants";
import { ButtonVariants, CalendarType, UserPlan } from "./types";

export interface GroupedAttributes {
  groupId: string | null;
  groupStart: string | null;
  groupEnd: string | null;
  selectedDays: string[] | null;
}

export interface Event {
  eventId: string;
  title: string;
  description: string;
  color: string;
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  startDate: string;
  endDate: string | null;
  selectedDays: boolean[] | null;
  spiltedReferenceId: string | null;
}

export interface Calendar {
  eventIdToEvent: Map<string, Event>;
  dateToEventId: Map<string, Set<string>>;
  timeZone: string;
}

export interface EventActionsState {
  error: Record<EVENT_NAMES, string>;
  message: string;
  eventToSet?: Event;
}

export interface CalendarActionsState {
  singleEvents: Event[];
  recurringEvents: Event[];
  message: string;
  calendarId: string;
}

export interface Range {
  start: string;
  end: string;
}

export interface DBNotification {
  requestingUserId: string;
  targetCalendarId: string;
  requestingUserName: string;
  targetCalendarName: string;
}

export interface ClientNotification extends DBNotification {
  id: string;
}

export interface InitialFetch {
  initalOwnedCalendars: DBCalendar[];
  initalMemberCalendars: DBCalendar[];
  initalSingle: Event[];
  initalRecurring: Event[];
  initialCalendarId: string;
  initialNotifications: DBNotification[];
}

export interface FetchedEvents {
  single: Event[];
  recurring: Event[];
}
export interface HoursAndMinutes {
  hours: number;
  minutes: number;
}

export interface PlanLimitations {
  maxSingleEvents: number;
  maxRecurringEvents: number;
  maxNotifications: number;
  maxOwnedCalendars: number;
  maxMemberCalendars: number;
  isFreeColorUse: boolean;
}

export interface ApiResponse<T = any> {
  data: T | null;
  message: string;
  error: string | null;
  status: API_STATUS;
  extra: string | null;
}

export interface DBUser {
  name: string;
  email: string;
  createdAt: string;
  calendars: string[];
  plan: UserPlan;
}

export interface ClientUser extends DBUser {
  userId: string;
  notifications: Map<string, Notification>;
}

export interface DBCalendar {
  members: string[];
  name: string;
  owner: string;
}

export interface ClientCalendar extends DBCalendar {
  id: string;
  tag: CalendarType;
}

export interface ButtonProps {
  label?: string;
  disbaled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  formAction?: (formData: FormData) => void;
  className?: string;
  variant?: ButtonVariants;
  isWithTextInput?: boolean;
}
