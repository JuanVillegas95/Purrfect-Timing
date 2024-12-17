import { Event, User, ActionsState } from "./interfaces";

export const HEADER_HEIGTH_ASIDE_WIDTH: number = 64; //multiple of 8, originally was set to 64
export const DAYS_HEIGTH_HOURS_WIDTH: number = 84;
export const LOGO_SIZE = HEADER_HEIGTH_ASIDE_WIDTH - 10;
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

export const COLORS: string[] = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
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

export const enum PICKERS {
  NONE,
  DATE,
  START_TIME,
  END_TIME,
  START_DATE,
  END_DATE,
  COLOR,
}

export const enum EVENT_NAMES {
  TITLE = "TITLE",
  DESCRIPTION = "DESCRIPTION",
  START_TIME = "START_TIME",
  END_TIME = "END_TIME",
  START_DATE = "START_DATE",
  END_DATE = "END_DATE",
  COLOR = "COLOR",
  REPEATING = "REPEATING",
  SELECTED_DAYS = "SELECTED_DAYS",
}

export const USER_ID: string = "BtXktmE5bOU5RHtNlw9vji9tcV23";
export const CALENDAR_ID: string = "VYApBkUSzwWqHb8DNd7l";

export const BLANK_EVENT: Event = {
  eventId: "",
  startHours: 0,
  startMinutes: 0,
  endHours: 0,
  endMinutes: 0,
  color: "",
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  selectedDays: null,
};

export const BLANK_EVENT_ERRORS = {
  [EVENT_NAMES.TITLE]: "",
  [EVENT_NAMES.DESCRIPTION]: "",
  [EVENT_NAMES.START_TIME]: "",
  [EVENT_NAMES.END_TIME]: "",
  [EVENT_NAMES.START_DATE]: "",
  [EVENT_NAMES.END_DATE]: "",
  [EVENT_NAMES.COLOR]: "",
  [EVENT_NAMES.REPEATING]: "",
  [EVENT_NAMES.SELECTED_DAYS]: "",
};

export const BLANK_ACTIONS_STATE: ActionsState = {
  error: { ...BLANK_EVENT_ERRORS },
  message: "",
  eventToSet: undefined,
};

export enum EVENT_FETCH_TESHHOLDS {
  MAX_EVENTS = 200,
  MIN_EVENTS = 50,
  MIN_DAYS = 7,
  MAX_DAYS = 30,
}
