import { toZonedTime } from "date-fns-tz";
import { User } from "./interfaces";
import { HOURS_HEIGHT_VH } from "./constants";

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
export const mostRecentMonday = (timeZone: string): Date => {
  const now: Date = toZonedTime(new Date(), timeZone);
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

export const formatDateToMMDDYYYY = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1);
  const day = String(date.getDate());
  return `${month}/${day}/${year}`;
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
