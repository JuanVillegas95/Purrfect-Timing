export interface GroupedAttributes {
  groupId: string | null;
  groupStart: string | null;
  groupEnd: string | null;
  selectedDays: string[] | null;
}

export interface Event {
  eventId: string;
  date: string;
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  color: string;
  icon: string;
  title: string;
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
  monday: Date;
}

export interface User {
  email: string;
  username: string;
  friends: { email: string; username: string }[];
  calendars: Map<string, Calendar>;
}

export interface BaseModalProps {
  slots: {
    header?: React.ReactNode;
    body?: React.ReactNode;
    footer?: React.ReactNode;
    button?: React.ReactNode;
  };
  title: string;
}
