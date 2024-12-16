"use server";
import { db } from "@config/firebase";
import { parseTimeString } from "@utils/functions";
import {
  USER_ID,
  BLANK_EVENT,
  CALENDAR_ID,
  DAYS,
  EVENT_NAMES,
} from "@utils/constants";
import { Event } from "@utils/interfaces";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

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
