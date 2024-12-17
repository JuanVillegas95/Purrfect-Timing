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
} from "firebase/firestore";
import {
  USER_ID,
  BLANK_EVENT,
  CALENDAR_ID,
  DAYS,
  EVENT_NAMES,
  EVENT_FETCH_TESHHOLDS,
} from "@utils/constants";
import { db } from "@config/firebase";
import { parseTimeString } from "@utils/functions";
import { Event } from "@utils/interfaces";

export const getEventsAndTimeZone_2 = async (
  rangeStart: string, // Start of range (ISO string or YYYY-MM-DD)
  rangeEnd: string, // End of range (ISO string or YYYY-MM-DD)
): Promise<{
  timeZone: string;
  events: { [key: string]: any }[];
} | null> => {
  try {
    // Step 1: Get Calendar Info
    const calendarDocRef = doc(db, `users/${USER_ID}/calendars/${CALENDAR_ID}`);
    const calendarDoc = await getDoc(calendarDocRef);

    if (!calendarDoc.exists()) {
      console.error("Calendar not found!");
      return null;
    }

    const calendarData = calendarDoc.data();
    const timeZone = calendarData?.timeZone || "Unknown Time Zone";

    // Step 2: Fetch Standalone Events
    const eventsCollectionRef = collection(calendarDocRef, "events");
    const standaloneQuery = query(
      eventsCollectionRef,
      where("startDate", ">=", rangeStart),
      where("startDate", "<=", rangeEnd),
      where("endDate", "==", null), // Ensures these are standalone events
    );

    const standaloneSnapshot = await getDocs(standaloneQuery);
    const standaloneEvents = standaloneSnapshot.docs.map(doc => doc.data());

    // Step 3: Fetch Recurring Events
    const recurringQuery = query(
      eventsCollectionRef,
      where("startDate", "<=", rangeEnd), // Events that start before or during the range
      where("endDate", ">=", rangeStart), // Events that end after or during the range
    );

    const recurringSnapshot = await getDocs(recurringQuery);
    const recurringEvents = recurringSnapshot.docs.map(doc => doc.data());

    // Step 4: Combine Results
    const events = [...standaloneEvents, ...recurringEvents];

    return {
      timeZone,
      events,
    };
  } catch (error) {
    console.error("Error retrieving calendar or events: ", error);
    return null;
  }
};

export const getEventsAndTimeZone = async (): Promise<{
  timeZone: string;
  events: { [key: string]: any }[];
} | null> => {
  try {
    const calendarDocRef = doc(db, `users/${USER_ID}/calendars/${CALENDAR_ID}`);
    const calendarDoc = await getDoc(calendarDocRef);

    if (!calendarDoc.exists()) {
      console.error("Calendar not found!");
      return null;
    }

    const calendarData = calendarDoc.data();
    const timeZone = calendarData?.timeZone || "Unknown Time Zone";
    if (!calendarData?.timeZone) {
      console.warn(
        "Calendar time zone is missing. Defaulting to 'Unknown Time Zone'.",
      );
    }

    const eventsCollectionRef = collection(calendarDocRef, "events");
    const querySnapshot = await getDocs(eventsCollectionRef);
    const events = querySnapshot.docs.map(doc => doc.data());

    return {
      timeZone,
      events,
    };
  } catch (error) {
    console.error("Error retrieving calendar or events: ", error);
    return null;
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
    await setDoc(docRef, newEvent);
    newEvent.eventId = docRef.id;
    return newEvent;
  } catch (error) {
    return Promise.reject(error);
  }
};
