import { Event, User } from "./interfaces";

export const HEADER_HEIGTH_ASIDE_WIDTH: number = 64; //multiple of 8, originally was set to 64
export const DAYS_HEIGTH_HOURS_WIDTH: number = 84;
export const HOURS_HEIGHT_VH: number = 8;

export const LEFT_MOUSE_CLICK: number = 0;
export const EVENT_TITLE_MAX_LENGTH: number = 40;
export const EVENT_DESCRIPTION_MAX_LENGTH: number = 200;

export const DAYS: string[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const enum MODALS {
  NONE,
  EVENT,
  CALENDARS,
  LOADING,
  FRIENDS,
  PROFILE,
  ABOUT_US,
}

export const USER_ID: string = "BtXktmE5bOU5RHtNlw9vji9tcV23";
export const CALENDAR_ID: string = "VYApBkUSzwWqHb8DNd7l";

export const BLANCK_CALENDAR_SERVER = {};

export const BLANK_EVENT: Event = {
  eventId: "",
  date: "",
  startHours: 0,
  startMinutes: 0,
  endHours: 0,
  endMinutes: 0,
  color: "",
  title: "",
  description: "",
  groupId: null,
  groupStart: null,
  groupEnd: null,
  selectedDays: null,
};
