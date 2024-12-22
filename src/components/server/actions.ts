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
  DocumentData,
  DocumentSnapshot,
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
import {
  CalendarActionsState,
  Event,
  UserCalendarActionsState,
} from "@utils/interfaces";

export const getUserCalendars = async (): Promise<
  UserCalendarActionsState[]
> => {
  try {
    const calendarCollectionRef = collection(db, `users/${USER_ID}/calendars`);
    const querySnapshot = await getDocs(calendarCollectionRef);

    const calendars = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      timeZone: doc.data().timeZone,
    }));

    return calendars;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCalendarData = async (
  rangeStart: string, // Start of range (ISO string or YYYY-MM-DD)
  rangeEnd: string, // End of range (ISO string or YYYY-MM-DD)
  calendarId?: string,
): Promise<CalendarActionsState> => {
  try {
    if (!calendarId) {
      const calendarsCollectionRef = collection(
        db,
        `users/${USER_ID}/calendars`,
      );
      const calendarsSnapshot = await getDocs(calendarsCollectionRef);

      if (calendarsSnapshot.empty) {
        throw new Error("No calendars found for this user.");
      }

      calendarId = calendarsSnapshot.docs[0].id;
    }

    const calendarDocRef = doc(db, `users/${USER_ID}/calendars/${calendarId}`);
    const calendarSnap = await getDoc(calendarDocRef);
    const calendarData = calendarSnap.data();

    if (!calendarData) {
      throw new Error("Calendar data is empty or undefined.");
    }

    const timeZone = calendarData.timeZone || "Unknown Time Zone";

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
      calendarId,
    };

    return blankCalendar;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCalendarActionsState = async (): Promise<
  UserCalendarActionsState[]
> => {
  try {
    const calendarsCollectionRef = collection(db, `users/${USER_ID}/calendars`);
    const calendarsSnapshot = await getDocs(calendarsCollectionRef);

    if (calendarsSnapshot.empty) {
      throw new Error("No calendars found for this user.");
    }

    const mappedDocs = calendarsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        timeZone: data.timeZone || "",
      };
    });

    return mappedDocs;
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
