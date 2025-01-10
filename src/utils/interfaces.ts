import { EVENT_NAMES } from "@utils/constants";

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

export interface UserServer {
  name: string;
  email: string;
  createdAt: Date;
  calendars: string[];
}

export interface CalendarServer {
  id: string;
  members: string[];
  name: string;
  owner: string;
}

export interface InitialFetch {
  ownedCalendars: CalendarServer[];
  memberCalendars: CalendarServer[];
  initalSingle: Event[];
  initalRecurring: Event[];
  initialCalendarId: string;
}

export interface FetchedEvents {
  single: Event[];
  recurring: Event[];
}
export interface HoursAndMinutes {
  hours: number;
  minutes: number;
}
