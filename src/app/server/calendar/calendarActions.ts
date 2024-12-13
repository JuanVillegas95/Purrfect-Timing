"use server";
import { db } from "@config/firebase";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { USER_ID, BLANK_EVENT, CALENDAR_ID } from "@utils/constants";

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
