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
  QueryDocumentSnapshot,
  documentId,
} from "firebase/firestore";
import {
  USER_ID,
  BLANK_EVENT,
  CALENDAR_ID,
  DAYS,
  EVENT_NAMES,
  BLANK_CALENDAR_ACTIONS_STATE,
  INTIAL_RANGE,
} from "@utils/constants";
import {
  addDateBy,
  formatDateToISO,
  fromUTCToZoned,
  getISORange,
  localTimeZone,
  mostRecentMonday,
  parseTimeString,
} from "@utils/functions";
import {
  CalendarActionsState,
  Event,
  UserServer,
  CalendarServer,
  InitialFetch,
  Range,
} from "@utils/interfaces";

import { auth, db } from "@db/firebaseClient";
import { createSession, decrypt } from "@db/session";
import { adminAuth, adminDb } from "@db/firebaseAdmin";
import { cookies } from "next/headers";
import { fromZonedTime } from "date-fns-tz";

export const createSessionServer = async (
  uid: string,
  email: string,
  name: string,
) => {
  const user = await adminDb.collection("users").doc(uid).get();
  if (!user.exists) {
    const newCalendar = {
      name: "New calendar",
      members: [],
      owner: user.id,
    };

    const calendarDocRef = await adminDb
      .collection("calendars")
      .add(newCalendar);

    const newUser: UserServer = {
      email,
      name,
      createdAt: new Date(),
      calendars: [calendarDocRef.id],
    };

    await adminDb.collection("users").doc(uid).set(newUser);
  }

  await createSession(uid);
};

export const initalFetch = async (): Promise<InitialFetch | null> => {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    const userId = session?.userId;
    if (!userId) {
      throw new Error("User is not authenticated through the cookie session");
    }

    const [ownedCalendarsSnapshot, memberCalendarsSnapshot] = await Promise.all(
      [
        adminDb.collection("calendars").where("owner", "==", userId).get(),
        adminDb
          .collection("calendars")
          .where("members", "array-contains", userId)
          .get(),
      ],
    );

    const ownedCalendars: CalendarServer[] = ownedCalendarsSnapshot.docs.map(
      doc => ({
        id: doc.id,
        members: doc.data().members,
        name: doc.data().name,
        owner: doc.data().owner,
      }),
    );

    const memberCalendars: CalendarServer[] = memberCalendarsSnapshot.docs.map(
      doc => ({
        id: doc.id,
        members: doc.data().members,
        name: doc.data().name,
        owner: doc.data().owner,
      }),
    );

    if (ownedCalendars.length <= 0) {
      throw new Error("authenticated user does not has an owned calendar");
    }

    const firstOwnedCalendar: CalendarServer = ownedCalendars[0];
    const eventsRef = adminDb
      .collection("calendars")
      .doc(firstOwnedCalendar.id)
      .collection("events");

    const localRange = getISORange(INTIAL_RANGE, localTimeZone());
    const range: Range = {
      start: formatDateToISO(fromZonedTime(localRange.start, localTimeZone())),
      end: formatDateToISO(fromZonedTime(localRange.end, localTimeZone())),
    };

    const standaloneSnapshot = await eventsRef
      .where("startDate", ">=", range.start)
      .where("startDate", "<=", range.end)
      .where("endDate", "==", null)
      .get();

    const recurringSnapshot = await eventsRef
      .where("startDate", "<=", range.end)
      .where("endDate", ">=", range.start)
      .get();

    const initalSingle: Event[] = standaloneSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        eventId: doc.id,
        title: data.title,
        description: data.description,
        color: data.color,
        startHours: data.startHours,
        startMinutes: data.startMinutes,
        endHours: data.endHours,
        endMinutes: data.endMinutes,
        startDate: data.startDate,
        endDate: data.endDate,
        selectedDays: data.selectedDays,
      } as Event;
    });

    const initalRecurring = recurringSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        eventId: doc.id,
        title: data.title,
        description: data.description,
        color: data.color,
        startHours: data.startHours,
        startMinutes: data.startMinutes,
        endHours: data.endHours,
        endMinutes: data.endMinutes,
        startDate: data.startDate,
        endDate: data.endDate,
        selectedDays: data.selectedDays,
      } as Event;
    });

    return {
      ownedCalendars,
      memberCalendars,
      initalSingle,
      initalRecurring,
      initialCalendarId: firstOwnedCalendar.id,
    };
  } catch (error) {
    console.error("Error during initialFetch:", error);
    return null;
  }
};
