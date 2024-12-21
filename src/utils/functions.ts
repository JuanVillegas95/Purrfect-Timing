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
import { WeekdaySets } from "./types";

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
      newErrors.END_DATE = "End date must be after start date.";
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

export const getWeekBuckets = (
  weekStartISO: string,
  weeklyEventsBucket: Map<string, WeekdaySets>,
): WeekdaySets => {
  if (!weeklyEventsBucket.has(weekStartISO)) {
    weeklyEventsBucket.set(weekStartISO, [
      new Set<string>(), // Monday (0)
      new Set<string>(), // Tuesday (1)
      new Set<string>(), // Wednesday (2)
      new Set<string>(), // Thursday (3)
      new Set<string>(), // Friday (4)
      new Set<string>(), // Saturday (5)
      new Set<string>(), // Sunday (6)
    ]);
  }
  return weeklyEventsBucket.get(weekStartISO)!;
};

export const getWeekStartISO = (date: Date, timeZone: string): string => {
  const monday = mostRecentMonday(timeZone, date);
  return formatDateToISO(monday);
};

export const addEventIdToBucket = (
  eventId: string,
  date: Date,
  timeZone: string,
  weeklyEventsBucket: Map<string, WeekdaySets>,
): void => {
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1; // Monday = 0, Sunday = 6
  const weekStartISO: string = getWeekStartISO(date, timeZone);

  const weekArray: WeekdaySets = getWeekBuckets(
    weekStartISO,
    weeklyEventsBucket,
  );
  weekArray[dayOfWeek].add(eventId);
};

export const deleteEventIdFromBucket = (
  eventId: string,
  date: Date,
  timeZone: string,
  weeklyEventsBucket: Map<string, WeekdaySets>,
): boolean => {
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const weekStartISO = getWeekStartISO(date, timeZone);
  const weekArray = weeklyEventsBucket.get(weekStartISO);
  if (!weekArray) {
    console.log("No weekarray");
    return false;
  }

  const a = weekArray[dayOfWeek].delete(eventId);

  if (weekArray.every(daySet => daySet.size === 0))
    weeklyEventsBucket.delete(weekStartISO);
  console.log("deletion from weekarray:");
  return a;
};

export const getLoopStart = (
  range: Range,
  recurringEvent: Event,
  timeZone: string,
): Date => {
  const effectiveStart =
    recurringEvent.startDate > range.start
      ? recurringEvent.startDate
      : range.start;

  const adjustedStart = addDateBy(new Date(effectiveStart), 1);
  return toZonedTime(adjustedStart, timeZone);
};

export const getLoopEnd = (
  range: Range,
  recurringEvent: Event,
  timeZone: string,
): Date => {
  const effectiveEnd =
    recurringEvent.endDate < range.end ? recurringEvent.endDate : range.end;

  const adjustedEnd = addDateBy(new Date(effectiveEnd), 1);
  return toZonedTime(adjustedEnd, timeZone);
};

export const mapWeekStartToBuckets = (
  calendarData: CalendarActionsState,
  range: { start: string; end: string },
): Map<string, WeekdaySets> => {
  const { singleEvents, recurringEvents, timeZone } = calendarData;

  const weekStartToBuckets = new Map<string, WeekdaySets>();
  for (const singleEvent of singleEvents) {
    addEventIdToBucket(
      singleEvent.eventId,
      toZonedTime(singleEvent.startDate, timeZone),
      timeZone,
      weekStartToBuckets,
    );
  }

  for (const recurringEvent of recurringEvents) {
    const loopStart: Date = getLoopStart(range, recurringEvent, timeZone);
    const loopEnd: Date = getLoopEnd(range, recurringEvent, timeZone);
    const i: Date = new Date(loopStart);
    while (i <= loopEnd) {
      const dayOfWeek = i.getDay() === 0 ? 6 : i.getDay() - 1;
      if (recurringEvent.selectedDays![dayOfWeek]) {
        addEventIdToBucket(
          recurringEvent.eventId,
          toZonedTime(i, timeZone),
          timeZone,
          weekStartToBuckets,
        );
      }
      i.setDate(i.getDate() + 1);
    }
  }
  return weekStartToBuckets;
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

export const areEventsOverlapping = (first: Event, second: Event): boolean => {
  const firstStart: number = timeInMinutes(
    first.startHours,
    first.startMinutes,
  );
  const firstEnd: number = timeInMinutes(first.endHours, first.endMinutes);
  const secondStart: number = timeInMinutes(
    second.startHours,
    second.startMinutes,
  );
  const secondEnd: number = timeInMinutes(second.endHours, second.endMinutes);
  return firstStart < secondEnd && secondStart < firstEnd;
};

export const createColumnsForDay = (dayEvents: Event[]): Event[][] => {
  dayEvents.sort((a: Event, b: Event) => {
    const aStart: number = timeInMinutes(a.startHours, a.startMinutes);
    const bStart: number = timeInMinutes(b.startHours, b.startMinutes);
    return aStart - bStart;
  });

  const columns: Event[][] = [];

  for (const event of dayEvents) {
    let placed = false;
    for (const col of columns) {
      const lastEventInCol = col[col.length - 1];
      if (!areEventsOverlapping(lastEventInCol, event)) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
    }
  }

  return columns;
};
