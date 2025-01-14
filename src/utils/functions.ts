import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { EventActionsState, Range, Event, HoursAndMinutes } from "./interfaces";

import {
  DAYS,
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  HOURS_HEIGHT_VH,
  EVENT_NAMES,
  BLANK_EVENT_ACTIONS_STATE,
  BLANK_EVENT_ERRORS,
  EVENT_FETCH_TESHHOLDS,
  COLORS,
  MAX_END_MINUTES,
  MAX_END_HOURS,
  MIN_START_MINUTES,
  MIN_START_HOURS,
} from "@utils/constants";
import { WeekdaySets } from "./types";
import { generateEventId } from "@db/clientActions";

export const minutesToHours = (minutes: number): number => minutes / 60;

export const hoursToMinutes = (hours: number): number => hours * 60;

export const vhToHours = (pixels: number): number => pixels / HOURS_HEIGHT_VH;

export const hoursToVh = (hours: number): number => hours * HOURS_HEIGHT_VH;

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getEventTotalMinutes = ({
  startHours,
  startMinutes,
  endHours,
  endMinutes,
}: Event) =>
  timeInMinutes(endHours, endMinutes) - timeInMinutes(startHours, startMinutes);

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

export const vhToTime = (vh: number): HoursAndMinutes => {
  const totalHours = vhToHours(vh);
  const totalMinutes = Math.round(hoursToMinutes(totalHours));
  const hours = Math.floor(minutesToHours(totalMinutes));
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

export const areDatesTheSame = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const generate24HourIntervals = (): string[] => {
  const timeArray: string[] = [];
  for (let i = 0; i < 24; i++) {
    const formattedTime = timeToTwoDigits(i);
    timeArray.push(`${formattedTime}:00`);
  }
  timeArray.push(`00:00`);

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
  let isSyncingHours = false; // Prevent recursive updates
  let isSyncingGrid = false;

  const syncScrollHandlerForMainGrid = () => {
    if (!hoursOfTheDay.current || !mainGrid.current || isSyncingHours) {
      return;
    }
    isSyncingGrid = true; // Prevent recursive triggering
    hoursOfTheDay.current.scrollTop = mainGrid.current.scrollTop;
    isSyncingGrid = false;
  };

  const syncScrollHandlerForHoursOfTheDay = () => {
    if (!hoursOfTheDay.current || !mainGrid.current || isSyncingGrid) {
      return;
    }
    isSyncingHours = true; // Prevent recursive triggering
    mainGrid.current.scrollTop = hoursOfTheDay.current.scrollTop;
    isSyncingHours = false;
  };

  // Attach event listeners
  mainGrid.current?.addEventListener("scroll", syncScrollHandlerForMainGrid);
  hoursOfTheDay.current?.addEventListener(
    "scroll",
    syncScrollHandlerForHoursOfTheDay,
  );

  // Cleanup function to remove event listeners
  return () => {
    mainGrid.current?.removeEventListener(
      "scroll",
      syncScrollHandlerForMainGrid,
    );
    hoursOfTheDay.current?.removeEventListener(
      "scroll",
      syncScrollHandlerForHoursOfTheDay,
    );
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

export const fromUTCToZoned = (
  ISODate: string,
  hours: number,
  minutes: number,
  timeZone: string,
) => {
  const utcDate = new Date(ISODate);
  utcDate.setUTCHours(hours, minutes);
  return toZonedTime(utcDate, timeZone);
};

export const fromZonedToUTC = (
  ISODate: string,
  hours: number,
  minutes: number,
  timeZone: string,
) => {
  const localDate = new Date(ISODate);
  localDate.setHours(hours, minutes, 0, 0);
  return fromZonedTime(localDate, timeZone);
};

export const fromZonedToZoned = (
  ISODate: string,
  hours: number,
  minutes: number,
  fromTimeZone: string,
  toTimeZone: string,
) => {
  const utcDate: Date = fromZonedToUTC(ISODate, hours, minutes, fromTimeZone);
  const newLocalISO: string = formatDateToISO(utcDate);
  const newLocalHours: number = utcDate.getHours();
  const newLocalMinutes: number = utcDate.getMinutes();

  return fromUTCToZoned(
    newLocalISO,
    newLocalHours,
    newLocalMinutes,
    toTimeZone,
  );
};

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
  const pad = (num: number) => num.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const string = `${year}-${month}-${day}T00:00:00`;
  return string;
};

export const parseTimeString = (time: string): HoursAndMinutes => {
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

export const fromUTCEventToZonedEvent = (event: Event, timeZone: string) => {
  const {
    startDate,
    startHours,
    startMinutes,
    endHours,
    endMinutes,
    endDate,
    selectedDays,
  } = event;

  const zonedStart: Date = fromUTCToZoned(
    startDate,
    startHours,
    startMinutes,
    timeZone,
  );

  const zonedEnd: Date = fromUTCToZoned(
    endDate ? endDate : startDate,
    endHours,
    endMinutes,
    timeZone,
  );

  const zonedStartDate = formatDateToISO(zonedStart);
  const zonedStartHours = zonedStart.getHours();
  const zonedStartMinutes = zonedStart.getMinutes();

  const zonedEndDate = formatDateToISO(zonedEnd);
  const zonedEndHours = zonedEnd.getHours();
  const zonedEndMinutes = zonedEnd.getMinutes();

  const zonedSelectedDays = endDate
    ? shiftSelectedDaysFromUTCToZoned(
        selectedDays!,
        startDate,
        startHours,
        startMinutes,
        timeZone,
      )
    : null;

  return {
    ...event,
    startDate: zonedStartDate,
    startHours: zonedStartHours,
    startMinutes: zonedStartMinutes,
    endDate: endDate ? zonedEndDate : null,
    endHours: zonedEndHours,
    endMinutes: zonedEndMinutes,
    selectedDays: zonedSelectedDays,
  } as Event;
};
export const mapEventIdToEvent = (
  singleEvents: Event[],
  recurringEvents: Event[],
  timeZone: string,
): Map<string, Event> => {
  const events: Event[] = [...singleEvents, ...recurringEvents];
  return new Map(
    events.map((event: Event) => [
      event.eventId,
      fromUTCEventToZonedEvent(event, timeZone),
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

export const addEventIdToBucket = (
  eventId: string,
  date: Date,
  timeZone: string,
  weeklyEventsBucket: Map<string, WeekdaySets>,
): void => {
  const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const weekStartISO: string = formatDateToISO(
    mostRecentMonday(timeZone, date),
  );
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
  const weekStartISO: string = formatDateToISO(
    mostRecentMonday(timeZone, date),
  );

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

export const getLoopStart = (range: Range, startDate: string): Date =>
  new Date(startDate > range.start ? startDate : range.start);

export const getLoopEnd = (range: Range, endDate: string): Date =>
  new Date(endDate < range.end ? endDate : range.end);

export const mapWeekStartToBuckets = (
  events: Event[],
  range: Range,
  timeZone: string,
): Map<string, WeekdaySets> => {
  const weekStartToBuckets = new Map<string, WeekdaySets>();
  for (const event of events) {
    if (event.endDate) {
      const loopStart: Date = getLoopStart(range, event.startDate);
      const loopEnd: Date = getLoopEnd(range, event.endDate);
      const i: Date = new Date(loopStart);
      while (i <= loopEnd) {
        const dayOfWeek = i.getDay() === 0 ? 6 : i.getDay() - 1;
        if (event.selectedDays![dayOfWeek]) {
          addEventIdToBucket(
            event.eventId,
            new Date(i),
            timeZone,
            weekStartToBuckets,
          );
        }
        i.setDate(i.getDate() + 1);
      }
    } else {
      addEventIdToBucket(
        event.eventId,
        new Date(event.startDate),
        timeZone,
        weekStartToBuckets,
      );
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

export const getISORange = (padding: number, timeZone: string): Range => {
  const monday: Date = mostRecentMonday(timeZone);
  return {
    start: formatDateToISO(addDateBy(monday, -padding)),
    end: formatDateToISO(addDateBy(monday, padding + 6)),
  };
};

export const getPaddingFromRange = (range: Range): number => {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diffInDays / 2) - 3;
};

export const shiftSelectedDaysFromZonedToUTC = (
  selectedDays: boolean[],
  zonedStartDate: string,
  zonedStartHours: number,
  zonedStartMinutes: number,
  timeZone: string,
): boolean[] => {
  const UTCDate = fromZonedToUTC(
    zonedStartDate,
    zonedStartHours,
    zonedStartMinutes,
    timeZone,
  );
  const zonedDate = new Date(zonedStartDate);
  const zonedIndex = zonedDate.getDay() === 0 ? 6 : zonedDate.getDay() - 1;
  const UTCIndex = UTCDate.getDay() === 0 ? 6 : UTCDate.getDay() - 1;
  let shift = UTCIndex - zonedIndex;
  shift = ((shift % 7) + 7) % 7;
  const newSelectedDays = Array(7).fill(false);
  for (let i = 0; i < 7; i++) {
    if (selectedDays[i]) {
      const newIndex = (i + shift) % 7;
      newSelectedDays[newIndex] = true;
    }
  }
  return newSelectedDays;
};

export const shiftSelectedDaysFromUTCToZoned = (
  selectedDays: boolean[],
  UTCStartDate: string,
  UTCHours: number,
  UTCMinutes: number,
  timeZone: string,
): boolean[] => {
  const zonedDate = fromUTCToZoned(
    UTCStartDate,
    UTCHours,
    UTCMinutes,
    timeZone,
  );
  const UTCDate = new Date(UTCStartDate);
  const zonedIndex = zonedDate.getDay() === 0 ? 6 : zonedDate.getDay() - 1;
  const UTCIndex = UTCDate.getDay() === 0 ? 6 : UTCDate.getDay() - 1;
  let shift = zonedIndex - UTCIndex;
  shift = ((shift % 7) + 7) % 7;
  const newSelectedDays = Array(7).fill(false);
  for (let i = 0; i < 7; i++) {
    if (selectedDays[i]) {
      const newIndex = (i + shift) % 7;
      newSelectedDays[newIndex] = true;
    }
  }
  return newSelectedDays;
};

export const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex];
};

export const roundTime = (hours: number, minutes: number): HoursAndMinutes => {
  const roundedMinutes = Math.round(minutes / 15) * 15;
  if (roundedMinutes === 60) {
    hours = (hours + 1) % 25;
    minutes = 0;
  } else {
    minutes = roundedMinutes;
  }

  return { hours, minutes };
};

export const splitEventAcrossMidnight = (
  eventToSplit: Event,
  currentCalendarId: string,
): { partA: Event; partB: Event } => {
  const isPreviousDaySplit = eventToSplit.startHours < 0;
  const newSpiltedReferenceId: string = generateEventId(currentCalendarId);

  let splittedPartA: Event;
  let splittedPartB: Event;

  if (isPreviousDaySplit) {
    splittedPartA = {
      ...eventToSplit,
      eventId: newSpiltedReferenceId,
      spiltedReferenceId: eventToSplit.eventId,
      startDate: formatDateToISO(
        addDateBy(new Date(eventToSplit.startDate), -1),
      ),
      startHours: 23,
      startMinutes: 45,
      endHours: 0,
      endMinutes: 0,
    };

    splittedPartB = {
      ...eventToSplit,
      eventId: eventToSplit.eventId,
      spiltedReferenceId: newSpiltedReferenceId,
      startHours: 0,
      startMinutes: 15,
      endHours: eventToSplit.endHours,
      endMinutes: eventToSplit.endMinutes,
    };
  } else {
    splittedPartA = {
      ...eventToSplit,
      eventId: newSpiltedReferenceId,
      spiltedReferenceId: eventToSplit.eventId,
      endHours: 23,
      endMinutes: 59,
    };

    splittedPartB = {
      ...eventToSplit,
      eventId: eventToSplit.eventId,
      spiltedReferenceId: newSpiltedReferenceId,
      startDate: formatDateToISO(
        addDateBy(new Date(eventToSplit.startDate), 1),
      ),
      startHours: 0,
      startMinutes: 0,
      endHours: eventToSplit.endHours - 24,
      endMinutes: eventToSplit.endMinutes,
    };
  }

  return {
    partA: splittedPartA,
    partB: splittedPartB,
  };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

// export const doesEventCrossMidnight = ({startHours , endHours, endMinutes}: Event): boolean => startHours < 0  ||
