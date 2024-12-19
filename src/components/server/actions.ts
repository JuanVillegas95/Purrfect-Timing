"use server";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  USER_ID,
  BLANK_EVENT,
  CALENDAR_ID,
  DAYS,
  EVENT_NAMES,
  BLANK_CALENDAR_ACTIONS_STATE,
} from "@utils/constants";
import { db } from "@config/firebase";
import { parseTimeString } from "@utils/functions";
import { CalendarActionsState, Event } from "@utils/interfaces";

export const getCalendarData = async (
  rangeStart: string, // Start of range (ISO string or YYYY-MM-DD)
  rangeEnd: string, // End of range (ISO string or YYYY-MM-DD)
): Promise<CalendarActionsState> => {
  try {
    const calendarDocRef = doc(db, `users/${USER_ID}/calendars/${CALENDAR_ID}`);
    const calendarDoc = await getDoc(calendarDocRef);

    const calendarData = calendarDoc.data();
    const timeZone = calendarData?.timeZone || "Unknown Time Zone";

    const eventsCollectionRef = collection(calendarDocRef, "events");
    const standaloneQuery = query(
      eventsCollectionRef,
      where("startDate", ">=", rangeStart),
      where("startDate", "<=", rangeEnd),
      where("endDate", "==", null),
    );

    const standaloneSnapshot = await getDocs(standaloneQuery);
    const singleEvents = standaloneSnapshot.docs.map(
      doc => doc.data() as Event,
    );

    const recurringQuery = query(
      eventsCollectionRef,
      where("startDate", "<=", rangeEnd),
      where("endDate", ">=", rangeStart),
    );

    const recurringSnapshot = await getDocs(recurringQuery);
    const recurringEvents = recurringSnapshot.docs.map(
      doc => doc.data() as Event,
    );

    const blankCalendar: CalendarActionsState = {
      ...BLANK_CALENDAR_ACTIONS_STATE,
      singleEvents,
      recurringEvents,
      timeZone,
    };

    return blankCalendar;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const setEventServer = async (
  formData: FormData,
  eventId?: string,
): Promise<Event> => {
  const title: string = formData.get(EVENT_NAMES.TITLE) as string;
  const startDate: string = formData.get(EVENT_NAMES.START_DATE) as string;
  const endDate: string = formData.get(EVENT_NAMES.END_DATE) as string;
  const description: string = formData.get(EVENT_NAMES.DESCRIPTION) as string;
  const color: string = formData.get(EVENT_NAMES.COLOR) as string;
  const { hours: startHours, minutes: startMinutes } = parseTimeString(
    formData.get(EVENT_NAMES.START_TIME) as string,
  );
  const { hours: endHours, minutes: endMinutes } = parseTimeString(
    formData.get(EVENT_NAMES.END_TIME) as string,
  );
  const selectedDays: boolean[] = DAYS.map(
    (day: string) => JSON.parse(formData.get(day) as string) as boolean,
  );
  console.log(color);

  const newEvent: Event = {
    ...BLANK_EVENT,
    title,
    startHours,
    startMinutes,
    endHours,
    endMinutes,
    description,
    selectedDays,
    startDate,
    endDate,
    color,
  };

  try {
    const eventsCollectionRef = collection(
      db,
      `users/${USER_ID}/calendars/${CALENDAR_ID}/events`,
    );

    if (eventId) {
      console.log("hi", eventId);
      const docRef = doc(eventsCollectionRef, eventId);
      const existingDoc = await getDoc(docRef);
      if (existingDoc.exists()) {
        const { eventId, ...newEventData } = newEvent;
        await setDoc(
          docRef,
          { ...existingDoc.data(), ...newEventData },
          { merge: true },
        );

        console.log(newEventData, "New event without ID");
        console.log(existingDoc.data(), "Existing data");
        console.log({ ...existingDoc.data(), ...newEventData } as Event);

        return { ...existingDoc.data(), ...newEventData } as Event;
      }
    }

    const docRef = doc(eventsCollectionRef);
    newEvent.eventId = docRef.id;
    await setDoc(docRef, newEvent);
    return newEvent;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteEventServer = async (eventId: string): Promise<boolean> => {
  try {
    const eventsCollectionRef = collection(
      db,
      `users/${USER_ID}/calendars/${CALENDAR_ID}/events`,
    );

    const docRef = doc(eventsCollectionRef, eventId);

    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists()) {
      console.warn(`Event with ID ${eventId} does not exist.`);
      return false;
    }

    await deleteDoc(docRef);
    console.log(`Event with ID ${eventId} has been deleted.`);
    return true;
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    return Promise.reject(error);
  }
};
