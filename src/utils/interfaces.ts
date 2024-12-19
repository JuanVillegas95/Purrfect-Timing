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
  endDate: string;
  selectedDays: boolean[] | null;
}

export interface Calendar {
  eventIdToEvent: Map<string, Event>;
  dateToEventId: Map<string, Set<string>>;
  timeZone: string;
}

export interface User {
  email: string;
  username: string;
  friends: { email: string; username: string }[];
  calendars: Map<string, Calendar>;
}

export interface EventActionsState {
  error: Record<EVENT_NAMES, string>;
  message: string;
  eventToSet?: Event;
}

export interface CalendarActionsState {
  // error: Record<EVENT_NAMES, string>;
  singleEvents: Event[];
  recurringEvents: Event[];
  message: string;
  timeZone: string;
}

export interface Range {
  start: string;
  end: string;
}
