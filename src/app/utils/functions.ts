import { toZonedTime } from "date-fns-tz";
import { User } from "./interfaces";
import { HOURS_HEIGHT_VH } from "./constants";
export const minutesToHours = (minutes: number): number => minutes / 60;

export const hoursToMinutes = (hours: number): number => hours * 60;

export const pixelsToHours = (pixels: number): number =>
  pixels / HOURS_HEIGHT_VH;

export const hoursToPixels = (hours: number): number => hours * HOURS_HEIGHT_VH;

export const formatTime = (unit: number): string =>
  unit < 10 ? `0${unit}` : `${unit}`;

export const timeInMinutes = (hours: number, minutes: number): number =>
  hoursToMinutes(hours) + minutes;
export const timeInPixels = (hours: number, minutes: number): number =>
  hoursToPixels(hours + minutesToHours(minutes));

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
    const formattedTime = formatTime(i);
    timeArray.push(`${formattedTime}:00`);
    timeArray.push(`${formattedTime}:30`);
  }
  return timeArray;
};

export const generate24Hours = (): string[] => {
  const hourArray: string[] = [];
  for (let i = 0; i < 24; i++) {
    hourArray.push(formatTime(i));
  }
  return hourArray;
};

export const generate60Minutes = (): string[] => {
  const minutesArray: string[] = [];
  for (let i = 0; i < 60; i++) {
    minutesArray.push(formatTime(i));
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

export const getMostRecentMonday = (timeZone: string): Date => {
  const now: Date = toZonedTime(new Date().setHours(0, 0, 0, 0), timeZone);
  const daysSinceMonday: number = now.getDay() === 0 ? 6 : now.getDay() - 1;
  now.setDate(now.getDate() - daysSinceMonday);
  return now;
};

// export const mountUser = (isNew: boolean): User => {
//   if (!isNew) {
//     return NEW_USER; //CHANGE THIS TO WHAT IS SUPPOSED TO BE
//   }
//   return NEW_USER;
// };

export const addDateBy = (date: Date, count: number): Date =>
  new Date(date.setDate(date.getDate() + count));

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

export const isValidHour = (hour: string): boolean => {
  if (!/^\d*$/.test(hour)) return false;
  const hourNumber = parseInt(hour, 10);
  if (hourNumber < 0 || hourNumber > 23) return false;
  return true;
};
