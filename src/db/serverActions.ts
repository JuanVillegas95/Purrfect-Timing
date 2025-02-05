"use server";
import { UserPlan } from "@utils/types";
import { INTIAL_RANGE, BLANK_API_RESPONSE, API_STATUS } from "@utils/constants";
import { formatDateToISO, getISORange, localTimeZone } from "@utils/functions";
import {
  Event,
  InitialFetch,
  Range,
  ApiResponse,
  DBUser,
  ClientCalendar,
  ClientUser,
  ClientNotification,
} from "@utils/interfaces";

import { adminDb } from "@db/firebaseAdmin";
import { fromZonedTime } from "date-fns-tz";
import { auth } from "@db/firebaseClient";
export const createSession = async (): Promise<ApiResponse<ClientUser>> => {
  const currentUser = auth.currentUser;
  if (
    !currentUser ||
    !currentUser.email ||
    !currentUser.displayName ||
    !currentUser.uid
  )
    return {
      ...BLANK_API_RESPONSE,
      data: null,
      status: API_STATUS.FAILED,
      error: "Something wrong went to the server",
    };
  const { uid, email, displayName: name } = currentUser;

  try {
    const user = await adminDb.collection("users").doc(uid).get();
    if (!user.exists) {
      const newCalendar = {
        name: "New calendar",
        members: [],
        owner: uid,
      };

      const calendarDocRef = await adminDb
        .collection("calendars")
        .add(newCalendar);

      const newUser: DBUser = {
        email,
        name,
        createdAt: new Date().toISOString(),
        calendars: [calendarDocRef.id],
        plan: "FREE" as UserPlan,
      };

      await adminDb.collection("users").doc(uid).set(newUser);

      return {
        ...BLANK_API_RESPONSE,
        data: { ...newUser, userId: uid, notifications: new Map() },
        status: API_STATUS.SUCCESS,
      };
    }

    // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // const session = await encrypt({ userId: uid, expiresAt });
    // (await cookies()).set("session", session, {
    //   httpOnly: true,
    //   secure: true,
    //   expires: expiresAt,
    // });

    return {
      ...BLANK_API_RESPONSE,
      data: { ...(user.data() as ClientUser), userId: user.id },
      status: API_STATUS.SUCCESS,
    };
  } catch (error) {
    return {
      ...BLANK_API_RESPONSE,
      status: API_STATUS.FAILED,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export const initalFetch = async (): Promise<InitialFetch | null> => {
  try {
    // const cookie = (await cookies()).get("session")?.value;
    // const session = await decrypt(cookie);
    // const userId: string = session?.userId as string;

    // if (!userId) {
    //   throw new Error("User is not authenticated through the cookie session");
    // }
    const notificationsRef = adminDb
      .collection("users")
      .doc("userId")
      .collection("notifications");

    const notificationSnapshot = await notificationsRef.get();

    const initialNotifications: ClientNotification[] =
      notificationSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          requestingUserId: data.requestingUserId,
          targetCalendarId: data.targetCalendarId,
          requestingUserName: data.requestingUserName,
          targetCalendarName: data.targetCalendarName,
        };
      }) || [];

    const [initalOwnedCalendarsSnapshot, initalMemberCalendarsSnapshot] =
      await Promise.all([
        adminDb.collection("calendars").where("owner", "==", "userId").get(),
        adminDb
          .collection("calendars")
          .where("members", "array-contains", "userId")
          .get(),
      ]);

    const initalOwnedCalendars: ClientCalendar[] =
      initalOwnedCalendarsSnapshot.docs.map(doc => ({
        id: doc.id,
        members: doc.data().members,
        name: doc.data().name,
        owner: doc.data().owner,
        tag: "OWNED",
        memberDetails: [],
      }));

    const initalMemberCalendars: ClientCalendar[] =
      initalMemberCalendarsSnapshot.docs.map(doc => ({
        id: doc.id,
        members: doc.data().members,
        name: doc.data().name,
        owner: doc.data().owner,
        tag: "MEMEBER",
        memberDetails: [],
      }));

    if (initalOwnedCalendars.length <= 0) {
      throw new Error("authenticated user does not has an owned calendar");
    }

    const firstOwnedCalendar: ClientCalendar = initalOwnedCalendars[0];
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
      initalOwnedCalendars,
      initalMemberCalendars,
      initalSingle,
      initalRecurring,
      initialCalendarId: firstOwnedCalendar.id,
      initialNotifications,
    };
  } catch (error) {
    console.error("Error during initialFetch:", error);
    return null;
  }
};
