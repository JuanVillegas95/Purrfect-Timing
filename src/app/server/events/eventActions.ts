"use server";
import { db } from "@config/firebase";
import { parseTimeString } from "@utils/functions";
import { USER_ID, BLANK_EVENT, CALENDAR_ID, DAYS } from "@utils/constants";
import { Event } from "@utils/interfaces";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

export const setEventServer = async (
  formData: FormData,
  eventId?: string,
): Promise<Event> => {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const description = formData.get("description") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const selectedDays: boolean[] = Array(7).fill(false);

  DAYS.forEach((day, index) => {
    const boolean = formData.get(day) as string;
    selectedDays[index] = JSON.parse(boolean) as boolean;
  });

  const { hours: startHours, minutes: startMinutes } =
    parseTimeString(startTime);
  const { hours: endHours, minutes: endMinutes } = parseTimeString(endTime);

  const newEvent: Event = {
    ...BLANK_EVENT,
    title,
    date,
    startHours,
    startMinutes,
    endHours,
    endMinutes,
    description,
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
