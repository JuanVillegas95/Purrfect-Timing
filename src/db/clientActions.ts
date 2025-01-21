"use client";

import {
  API_STATUS,
  BLANK_API_RESPONSE,
  BLANK_DB_CALENDAR,
  BLANK_EVENT,
  DAYS,
  EVENT_NAMES,
  PLAN_LIMITATIONS,
} from "@utils/constants";
import {
  formatDateToISO,
  fromZonedToUTC,
  getISORange,
  parseTimeString,
  shiftSelectedDaysFromZonedToUTC,
} from "@utils/functions";
import {
  ApiResponse,
  ClientCalendar,
  ClientUser,
  DBCalendar,
  DBNotification,
  DBUser,
  Event,
  FetchedEvents,
} from "@utils/interfaces";
import {
  DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebaseClient";
import { fromZonedTime } from "date-fns-tz";
import { Range } from "@utils/interfaces";
import { UserPlan } from "@utils/types";
import { addCalendarSchema, editCalendarSchema } from "@utils/schemas";

export const setEventServer = async (
  formData: FormData,
  calendarId: string,
  timeZone: string,
  eventId?: string,
): Promise<Event> => {
  const title: string = formData.get(EVENT_NAMES.TITLE) as string;
  const description: string = formData.get(EVENT_NAMES.DESCRIPTION) as string;
  const color: string = formData.get(EVENT_NAMES.COLOR) as string;
  const startDate: string = formData.get(EVENT_NAMES.START_DATE) as string;
  const endDate: string = formData.get(EVENT_NAMES.END_DATE) as string;
  let { hours: startHours, minutes: startMinutes } = parseTimeString(
    formData.get(EVENT_NAMES.START_TIME) as string,
  );
  const { hours: endHours, minutes: endMinutes } = parseTimeString(
    formData.get(EVENT_NAMES.END_TIME) as string,
  );
  const selectedDays: boolean[] | null = DAYS.map(
    (day: string) => JSON.parse(formData.get(day) as string) as boolean,
  );

  const utcStartDate: Date = fromZonedToUTC(
    `${startDate}T00:00:00`,
    startHours,
    startMinutes,
    timeZone,
  );

  const UTCStartDate: string = formatDateToISO(utcStartDate);
  const UTCStartHours: number = utcStartDate.getUTCHours();
  const UTCStartMinutes: number = utcStartDate.getUTCMinutes();

  const utcEndDate: Date = fromZonedToUTC(
    endDate ? `${endDate}T00:00:00` : `${startDate}T00:00:00`,
    endHours,
    endMinutes,
    timeZone,
  );

  const UTCEndDate: string | null = endDate
    ? formatDateToISO(utcEndDate)
    : null;
  const UTCEndHours: number = utcEndDate.getUTCHours();
  const UTCEndMinutes: number = utcEndDate.getUTCMinutes();

  const UTCSelectedDays = shiftSelectedDaysFromZonedToUTC(
    selectedDays!,
    `${startDate}T00:00:00`,
    startHours,
    startMinutes,
    timeZone,
  );

  const newEvent: Event = {
    ...BLANK_EVENT,
    title,
    description,
    color,
    startDate: UTCStartDate,
    startHours: UTCStartHours,
    startMinutes: UTCStartMinutes,
    endDate: UTCEndDate,
    endHours: UTCEndHours,
    endMinutes: UTCEndMinutes,
    selectedDays: UTCSelectedDays,
  };

  try {
    const eventsCollectionRef = collection(
      db,
      `calendars/${calendarId}/events`,
    );
    let docRef: DocumentReference;

    if (eventId) {
      docRef = doc(eventsCollectionRef, eventId);
    } else {
      docRef = doc(eventsCollectionRef);
      newEvent.eventId = docRef.id;
    }

    const updatedEvent = await runTransaction(db, async transaction => {
      const docSnap = await transaction.get(docRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data();
        const { eventId: _, ...newEventData } = newEvent;
        const merged = { ...existingData, ...newEventData };
        transaction.set(docRef, merged, { merge: true });
        return merged as Event;
      } else {
        transaction.set(docRef, newEvent);
        return newEvent;
      }
    });

    return updatedEvent;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteEventServer = async (
  eventId: string,
  calendarId: string,
): Promise<boolean> => {
  try {
    const eventsCollectionRef = collection(
      db,
      `calendars/${calendarId}/events`,
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

export const getEvents = async (
  calendarId: string,
  localRange: Range,
  timeZone: string,
): Promise<FetchedEvents | null> => {
  try {
    const range: Range = {
      start: formatDateToISO(fromZonedTime(localRange.start, timeZone)),
      end: formatDateToISO(fromZonedTime(localRange.end, timeZone)),
    };

    const eventsCollectionRef = collection(
      db,
      `calendars/${calendarId}/events`,
    );

    const standaloneQuery = query(
      eventsCollectionRef,
      where("startDate", ">=", range.start),
      where("startDate", "<=", range.end),
      where("endDate", "==", null),
    );

    const recurringQuery = query(
      eventsCollectionRef,
      where("startDate", "<=", range.start),
      where("endDate", ">=", range.end),
    );

    const [standaloneSnapshot, recurringSnapshot] = await Promise.all([
      getDocs(standaloneQuery),
      getDocs(recurringQuery),
    ]);

    const fetchedSingle: Event[] = standaloneSnapshot.docs.map(doc => {
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

    const fetchedRecurring: Event[] = recurringSnapshot.docs.map(doc => {
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
      single: fetchedSingle,
      recurring: fetchedRecurring,
    } as FetchedEvents;
  } catch (error) {
    console.error("Error during initialFetch:", error);
    return null;
  }
};

export const generateEventId = (calendarId: string): string => {
  const eventsCollectionRef = collection(db, `calendars/${calendarId}/events`);
  const docRef = doc(eventsCollectionRef);
  return docRef.id;
};

export const generateCalendarId = (): string => {
  const eventsCollectionRef = collection(db, "calendars");
  const docRef = doc(eventsCollectionRef);
  return docRef.id;
};

export const insertCalendar = async (
  prevState: ApiResponse<ClientCalendar | null> | null,
  data: {
    user: ClientUser;
    ownedCalendarSize: number;
    memberCalendarSize: number;
    calendarId: string;
  },
): Promise<ApiResponse<ClientCalendar | null> | null> => {
  const { user, ownedCalendarSize, memberCalendarSize, calendarId } = data;
  const isNewCalendarRequest: boolean = calendarId.length === 0;
  if (isNewCalendarRequest) {
    if (ownedCalendarSize >= PLAN_LIMITATIONS[user.plan].maxOwnedCalendars) {
      return {
        ...prevState,
        error: "Exceeded owned calendars limit for the current plan",
        status: API_STATUS.VALIDATION_BLOCKED,
        message: "",
        data: null,
        extra: null,
      };
    }
    try {
      const calendarDocRef = doc(collection(db, "calendars"));
      const newServerCalendar: DBCalendar = {
        ...BLANK_DB_CALENDAR,
        owner: user.userId,
      };
      const newClientCalendar: ClientCalendar = {
        ...newServerCalendar,
        id: calendarDocRef.id,
        tag: "OWNED",
      };
      await setDoc(calendarDocRef, newServerCalendar);
      return {
        ...prevState,
        error: null,
        status: API_STATUS.SUCCESS,
        message: `Calendar created successfully with ID: ${calendarDocRef.id}`,
        data: newClientCalendar,
        extra: "Update calendars",
      };
    } catch (error) {
      console.error("Error creating new calendar:", error);
      return {
        ...prevState,
        error: "Failed to create a new calendar. Please try again later.",
        status: API_STATUS.FAILED,
        message: "",
        data: null,
        extra: null,
      };
    }
  } else {
    if (memberCalendarSize >= PLAN_LIMITATIONS[user.plan].maxMemberCalendars) {
      return {
        ...prevState,
        error: "Exceeded member calendars limit for the current plan",
        status: API_STATUS.VALIDATION_BLOCKED,
        message: "",
        data: null,
        extra: null,
      };
    }

    const validateCalendarId = addCalendarSchema.safeParse(calendarId);
    if (!validateCalendarId.success) {
      return {
        ...prevState,
        error: validateCalendarId.error.issues[0].message,
        status: API_STATUS.VALIDATION_BLOCKED,
        message: "",
        data: null,
        extra: null,
      };
    }

    try {
      const calendarDocRef = doc(db, "calendars", calendarId);
      const calendarDoc = await getDoc(calendarDocRef);

      if (!calendarDoc.exists()) {
        return {
          ...prevState,
          error: "No such calendar exists with that ID",
          status: API_STATUS.VALIDATION_BLOCKED,
          message: "",
          data: null,
          extra: null,
        };
      }

      const ownerId = calendarDoc.data().owner;
      const calendarName = calendarDoc.data().name;

      const notificationsRef = collection(
        db,
        "users",
        ownerId,
        "notifications",
      );

      const notificationQuery = query(
        notificationsRef,
        where("requestingUserId", "==", user.userId),
        where("targetCalendarId", "==", calendarId),
      );

      const querySnapshot = await getDocs(notificationQuery);

      if (!querySnapshot.empty) {
        return {
          ...prevState,
          error: "A similar notification already exists",
          status: API_STATUS.VALIDATION_BLOCKED,
          message: "",
          data: null,
          extra: null,
        };
      }

      // Create the new notification
      const newNotification: DBNotification = {
        requestingUserId: user.userId,
        targetCalendarId: calendarId,
        requestingUserName: user.name,
        targetCalendarName: calendarName,
      };

      await addDoc(notificationsRef, newNotification);

      return {
        ...prevState,
        error: null,
        status: API_STATUS.SUCCESS,
        message: `A notification has been sent to join the calendar with ID: "${calendarId}"`,
        data: null,
        extra: "New notification",
      };
    } catch (error) {
      console.error("Error adding calendar or sending notification:", error);
      return {
        ...prevState,
        error: "Failed to send notification. Please try again later",
        status: API_STATUS.FAILED,
        message: "",
        data: null,
        extra: null,
      };
    }
  }
};

export const deleteCalendar = async (
  prevState: ApiResponse<ClientCalendar[]> | null,
  data: {
    calendars: ClientCalendar[];
    calendarIdToDelete: string;
    ownedCalendarSize: number;
  },
): Promise<ApiResponse<ClientCalendar[]> | null> => {
  const { calendars, ownedCalendarSize, calendarIdToDelete } = data;
  if (ownedCalendarSize === 1)
    return {
      ...prevState,
      error: "At least one active calendar is required",
      status: API_STATUS.FAILED,
      message: "",
      data: null,
      extra: null,
    };

  try {
    const docRef = doc(db, "calendars", calendarIdToDelete);

    const calendarDoc = await getDoc(docRef);
    if (!calendarDoc.exists()) {
      return {
        ...prevState,
        error: "The calendar ID does not exist",
        status: API_STATUS.FAILED,
        message: "",
        data: null,
        extra: null,
      };
    }
    const calendarsCopy = calendars.filter(
      calendar => calendar.id !== calendarIdToDelete,
    );

    await deleteDoc(docRef);
    return {
      ...prevState,
      error: "",
      status: API_STATUS.SUCCESS,
      message: `Calendar with ID: ${calendarIdToDelete} has been deleted`,
      data: calendarsCopy,
      extra: "Delete Calendar",
    };
  } catch (error) {
    return {
      ...prevState,
      error: "Failed to delete calendar. Please try again later",
      status: API_STATUS.FAILED,
      message: "",
      data: null,
      extra: null,
    };
  }
};

export const editCalendarName = async (
  prevState: ApiResponse<string | null> | null,
  data: {
    calendarIdToEdit: string;
    newName: string;
  },
): Promise<ApiResponse<string | null> | null> => {
  const { calendarIdToEdit, newName } = data;
  const validateNewName = editCalendarSchema.safeParse(newName);

  if (!validateNewName.success) {
    return {
      ...prevState,
      error: validateNewName.error.issues[0].message,
      status: API_STATUS.VALIDATION_BLOCKED,
      message: "",
      data: null,
      extra: null,
    };
  }

  try {
    return {
      ...prevState,
      error: "",
      status: API_STATUS.SUCCESS,
      message: `Calendar with ID:  has been deleted`,
      data: null,
      extra: "Delete Calendar",
    };
  } catch (error) {
    return {
      ...prevState,
      error: "Failed to delete calendar. Please try again later",
      status: API_STATUS.FAILED,
      message: "",
      data: null,
      extra: null,
    };
  }
};
