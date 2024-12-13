export interface GroupedAttributes {
  groupId: string | null;
  groupStart: string | null;
  groupEnd: string | null;
  selectedDays: string[] | null;
}

export interface Event {
  eventId: string;
  title: string;
  date: string;
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  color: string;
  description: string;
  groupId: string | null;
  groupStart: string | null;
  groupEnd: string | null;
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
