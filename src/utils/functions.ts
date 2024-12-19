import { toZonedTime } from "date-fns-tz";
import {
  EventActionsState,
  Range,
  Event,
  CalendarActionsState,
} from "./interfaces";
import {
  DAYS,
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  HOURS_HEIGHT_VH,
  EVENT_NAMES,
  BLANK_EVENT_ACTIONS_STATE,
  BLANK_EVENT_ERRORS,
  EVENT_FETCH_TESHHOLDS,
} from "@utils/constants";

export const minutesToHours = (minutes: number): number => minutes / 60;

export const hoursToMinutes = (hours: number): number => hours * 60;

export const pixelsToHours = (pixels: number): number =>
  pixels / HOURS_HEIGHT_VH;

export const hoursToVh = (hours: number): number => hours * HOURS_HEIGHT_VH;

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const ianaToReadable = (iana: string) => iana.split("_").join(" ");

export const timeToTwoDigits = (unit: number): string =>
  unit < 10 ? `0${unit}` : `${unit}`;

export const formatTime = (hours: number, minutes: number): string => {
  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${paddedHours}:${paddedMinutes}`;
};

export const timeInMinutes = (hours: number, minutes: number): number =>
  hoursToMinutes(hours) + minutes;

export const timeInVh = (hours: number, minutes: number): number =>
  hoursToVh(hours + minutesToHours(minutes));

export const pixelsToTime = (
  distanceFromTop: number,
): { hours: number; minutes: number } => {
  const totalHours = pixelsToHours(distanceFromTop);
  const totalMinutes = Math.round(hoursToMinutes(totalHours));
  const hours = Math.floor(minutesToHours(totalMinutes));
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

export const generate24HourIntervals = (): string[] => {
  const timeArray: string[] = [];
  for (let i = 0; i < 24; i++) {
    const formattedTime = timeToTwoDigits(i);
    timeArray.push(`${formattedTime}:00`);
    timeArray.push(`${formattedTime}:30`);
  }
  return timeArray;
};

export const generate24Hours = (): string[] => {
  const hourArray: string[] = [];
  for (let i = 0; i < 24; i++) {
    hourArray.push(timeToTwoDigits(i));
  }
  return hourArray;
};

export const generate60Minutes = (): string[] => {
  const minutesArray: string[] = [];
  for (let i = 0; i < 60; i++) {
    minutesArray.push(timeToTwoDigits(i));
  }
  return minutesArray;
};

export const syncScroll = (
  hoursOfTheDay: React.RefObject<HTMLElement | undefined>,
  mainGrid: React.RefObject<HTMLElement | undefined>,
): (() => void) => {
  const syncScrollHandler = () => {
    if (
      hoursOfTheDay &&
      mainGrid &&
      hoursOfTheDay.current &&
      mainGrid.current
    ) {
      const maxScrollTop =
        hoursOfTheDay.current.scrollHeight - hoursOfTheDay.current.clientHeight;
      const scrollTop = mainGrid.current.scrollTop;

      if (scrollTop > maxScrollTop) {
        mainGrid.current.scrollTop = maxScrollTop;
      }

      hoursOfTheDay.current.scrollTop = mainGrid.current.scrollTop;
    }
  };

  hoursOfTheDay.current?.addEventListener("scroll", syncScrollHandler);
  mainGrid.current?.addEventListener("scroll", syncScrollHandler);

  return () => {
    hoursOfTheDay.current?.removeEventListener("scroll", syncScrollHandler);
    mainGrid.current?.removeEventListener("scroll", syncScrollHandler);
  };
};

export const updateTime = (callback: () => void): (() => void) => {
  const interval = setInterval(callback, 60000);
  return () => clearInterval(interval);
};

export const handleKeyboard = (callback: () => void): (() => void) => {
  const handleKeyboardEvent = (e: KeyboardEvent) => {
    if (["Esc", "Escape"].includes(e.key)) callback();
  };

  window.addEventListener("keydown", handleKeyboardEvent);
  return () => window.removeEventListener("keydown", handleKeyboardEvent);
};

// const now: Date = toZonedTime(new Date().setHours(0, 0, 0, 0), timeZone); // MAYBE CHANGE THIS ONE
export const mostRecentMonday = (timeZone: string, date?: Date): Date => {
  const now: Date = toZonedTime(date ? date : new Date(), timeZone);
  const daysSinceMonday: number = now.getDay() === 0 ? 6 : now.getDay() - 1;
  now.setDate(now.getDate() - daysSinceMonday);
  return now;
};

export const addDateBy = (date: Date, count: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + count);
  return newDate;
};

export const isValidHour = (hour: string): boolean => {
  if (!/^\d*$/.test(hour)) return false;
  const hourNumber = parseInt(hour, 10);
  if (hourNumber < 0 || hourNumber > 23) return false;
  return true;
};

export const localTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatMonthRange = (recentMonday: Date): string => {
  const nextWeek: Date = addDateBy(recentMonday, 7);

  const recentMondayLong: string = recentMonday.toLocaleDateString("en-US", {
    month: "long",
  });
  const recentMondayShort: string = recentMonday.toLocaleDateString("en-US", {
    month: "short",
  });
  const nextWeekShort: string = nextWeek.toLocaleDateString("en-US", {
    month: "short",
  });

  return nextWeek.getMonth() === recentMonday.getMonth()
    ? recentMondayLong
    : `${recentMondayShort}-${nextWeekShort}`;
};

export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseTimeString = (
  time: string,
): { hours: number; minutes: number } => {
  const [hours, minutes] = time.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time format");
  }
  return { hours, minutes };
};

export const validateEventForm = (
  formData: FormData,
  isRepeating: boolean,
): EventActionsState => {
  const newErrors: Record<EVENT_NAMES, string> = { ...BLANK_EVENT_ERRORS };

  const title = formData.get(EVENT_NAMES.TITLE) as string;
  if (title.length > EVENT_TITLE_MAX_LENGTH) {
    newErrors.TITLE = `Description must not exceed ${EVENT_TITLE_MAX_LENGTH} characters.`;
  }

  const color = formData.get(EVENT_NAMES.COLOR) as string;
  if (!color) {
    console.log(color);
    newErrors.COLOR = `Pick a color`;
  }

  const description = formData.get(EVENT_NAMES.DESCRIPTION) as string;
  if (description.length > EVENT_DESCRIPTION_MAX_LENGTH) {
    newErrors.DESCRIPTION = `Description must not exceed ${EVENT_DESCRIPTION_MAX_LENGTH} characters.`;
  }

  const startDate = formData.get(EVENT_NAMES.START_DATE) as string;
  if (!startDate) newErrors.START_DATE = "Start Date is required.";

  const startTime = formData.get(EVENT_NAMES.START_TIME) as string;
  const endTime = formData.get(EVENT_NAMES.END_TIME) as string;
  if (!startTime || !endTime) {
    newErrors.START_TIME = "Start and end times are required.";
  } else if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    newErrors.END_TIME = "End time must be after start time.";
  }

  if (isRepeating) {
    const endDate = formData.get(EVENT_NAMES.END_DATE) as string;
    if (!endDate) {
      newErrors.END_DATE =
        "Start and end dates are required for repeating events.";
    } else if (startDate >= endDate) {
      newErrors.REPEATING = "End date must be after start date.";
    }
    let flag: boolean = false;
    for (const day of DAYS) {
      const boolean = formData.get(day) as string;
      if (boolean === "true") flag = true;
    }
    if (!flag) newErrors.SELECTED_DAYS = "At least one day must be selected.";
  }

  return { ...BLANK_EVENT_ACTIONS_STATE, error: newErrors };
};

export const mapEventIdToEvent = (
  calendarData: CalendarActionsState,
): Map<string, Event> => {
  const { singleEvents, recurringEvents } = calendarData;
  return new Map(
    [...singleEvents, ...recurringEvents].map((event: Event) => [
      event.eventId,
      event,
    ]),
  );
};

// Futher optimization for  recurring events mapping
// Interval Tree
// Depending on the datra either use a an heurisitc  you can do this absed on a cost function
// loop (rangeStart, rangeEnd) x each event efficient in short ranges
// loop [loopStart, loopEnd] based on event range x  each event efficient  with large ranges

export const mapDateToEventIds = (
  calendarData: CalendarActionsState,
  range: { start: string; end: string },
): Map<string, Set<string>> => {
  const { singleEvents, recurringEvents } = calendarData;
  const map = new Map<string, Set<string>>();

  for (const singleEvent of singleEvents) {
    const dateSet = map.get(singleEvent.startDate) || new Set<string>();
    dateSet.add(singleEvent.eventId);
    map.set(singleEvent.startDate, dateSet);
  }

  for (const recurringEvent of recurringEvents) {
    const loopStart = new Date(
      recurringEvent.startDate > range.start
        ? recurringEvent.startDate
        : range.start,
    );
    const loopEnd = new Date(
      recurringEvent.endDate < range.end ? recurringEvent.endDate : range.end,
    );

    const i = new Date(loopStart);
    while (i <= loopEnd) {
      const dayOfTheWeek = i.getDay() === 0 ? 6 : i.getDay() - 1;
      if (!recurringEvent.selectedDays![dayOfTheWeek]) {
        i.setDate(i.getDate() + 1);
        continue;
      }

      const formattedDate = formatDateToISO(i);
      const dateSet = map.get(formattedDate) || new Set<string>();
      dateSet.add(recurringEvent.eventId);
      map.set(formattedDate, dateSet);

      i.setDate(i.getDate() + 1);
    }
  }

  return map;
};

export const calculateRangeDays = (start: string, end: string): number =>
  Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24),
  ) + 1;

export const adjustFetchRange = (
  eventCount: number,
  range: Range,
  monday: Date,
  timeZone: string,
): Range => {
  const currentDays: number = calculateRangeDays(range.start, range.end);

  let newDays: number;
  if (eventCount > EVENT_FETCH_TESHHOLDS.MAX_EVENTS) {
    newDays = Math.max(EVENT_FETCH_TESHHOLDS.MIN_DAYS, currentDays / 2);
  } else if (eventCount < EVENT_FETCH_TESHHOLDS.MIN_EVENTS) {
    newDays = Math.min(EVENT_FETCH_TESHHOLDS.MAX_DAYS, currentDays * 1.5);
  } else {
    newDays = currentDays;
  }

  if (newDays === currentDays) return range;

  const halfDays: number = Math.floor(newDays / 2);
  const calculatedStart: Date = addDateBy(monday, -halfDays);
  const calculatedEnd: Date = addDateBy(monday, halfDays);

  const start: Date = mostRecentMonday(timeZone, calculatedStart);
  const end: Date = addDateBy(mostRecentMonday(timeZone, calculatedEnd), 6);

  return { start: formatDateToISO(start), end: formatDateToISO(end) };
};
