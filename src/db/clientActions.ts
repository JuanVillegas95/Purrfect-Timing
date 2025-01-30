"use client";

import {
  API_STATUS,
  BLANK_DB_CALENDAR,
  BLANK_EVENT,
  DAYS,
  EVENT_NAMES,
  PLAN_LIMITATIONS,
} from "@utils/constants";
import {
  formatDateToISO,
  fromZonedToUTC,
  parseTimeString,
  shiftSelectedDaysFromZonedToUTC,
} from "@utils/functions";
import {
  ApiResponse,
  ClientCalendar,
  ClientNotification,
  ClientUser,
  DBCalendar,
  DBNotification,
  Event,
  FetchedEvents,
} from "@utils/interfaces";
import {
  DocumentReference,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebaseClient";
import { fromZonedTime } from "date-fns-tz";
import { Range } from "@utils/interfaces";
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
  const { hours: startHours, minutes: startMinutes } = parseTimeString(
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const generateUserId = (): string => {
  const eventsCollectionRef = collection(db, "users");
  const docRef = doc(eventsCollectionRef);
  return docRef.id;
};

export const insertCalendar = async (data: {
  user: ClientUser;
  ownedCalendarSize: number;
  memberCalendarSize: number;
  calendarId: string;
  calendarsIds: string[];
}): Promise<ApiResponse<ClientCalendar | null> | null> => {
  const {
    user,
    ownedCalendarSize,
    memberCalendarSize,
    calendarId,
    calendarsIds,
  } = data;
  const isNewCalendarRequest: boolean = calendarId.length === 0;
  if (calendarsIds.includes(calendarId)) {
    return {
      error: "Cannot join an owned calendar",
      status: API_STATUS.VALIDATION_BLOCKED,
      message: "",
      data: null,
      extra: null,
    };
  }

  if (isNewCalendarRequest) {
    if (ownedCalendarSize >= PLAN_LIMITATIONS[user.plan].maxOwnedCalendars) {
      return {
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
        memberDetails: [],
      };
      await setDoc(calendarDocRef, newServerCalendar);
      return {
        error: null,
        status: API_STATUS.SUCCESS,
        message: `Calendar created successfully with ID: ${calendarDocRef.id}`,
        data: newClientCalendar,
        extra: "Update calendars",
      };
    } catch (error) {
      console.error("Error creating new calendar:", error);
      return {
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
        error: null,
        status: API_STATUS.SUCCESS,
        message: `A notification has been sent to join the calendar with ID: "${calendarId}"`,
        data: null,
        extra: "New notification",
      };
    } catch (error) {
      console.error("Error adding calendar or sending notification:", error);
      return {
        error: "Failed to send notification. Please try again later",
        status: API_STATUS.FAILED,
        message: "",
        data: null,
        extra: null,
      };
    }
  }
};

export const deleteCalendar = async (data: {
  calendars: ClientCalendar[];
  calendarIdToDelete: string;
  ownedCalendarSize: number;
}): Promise<ApiResponse<ClientCalendar[]> | null> => {
  const { calendars, ownedCalendarSize, calendarIdToDelete } = data;
  if (ownedCalendarSize === 1)
    return {
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
      error: "",
      status: API_STATUS.SUCCESS,
      message: `Calendar with ID: ${calendarIdToDelete} has been deleted`,
      data: calendarsCopy,
      extra: "Delete Calendar",
    };
  } catch (error) {
    console.error("Error adding calendar or sending notification:", error);

    return {
      error: "Failed to delete calendar. Please try again later",
      status: API_STATUS.FAILED,
      message: "",
      data: null,
      extra: null,
    };
  }
};

export const editCalendarName = async (data: {
  calendarIdToEdit: string;
  newName: string;
}): Promise<ApiResponse<string | null>> => {
  const { calendarIdToEdit, newName } = data;
  const validateNewName = editCalendarSchema.safeParse(newName);
  if (!validateNewName.success) {
    return {
      error: validateNewName.error.issues[0].message,
      status: API_STATUS.VALIDATION_BLOCKED,
      message: "",
      data: null,
      extra: null,
    };
  }

  try {
    const docRef = doc(db, "calendars", calendarIdToEdit);
    const calendarDoc = await getDoc(docRef);
    if (!calendarDoc.exists()) {
      return {
        error: "The calendar ID does not exist",
        status: API_STATUS.FAILED,
        message: "",
        data: null,
        extra: null,
      };
    }

    await updateDoc(docRef, { name: newName });
    return {
      error: null,
      status: API_STATUS.SUCCESS,
      message: "Calendar name updated",
      data: newName,
      extra: null,
    };
  } catch (error) {
    console.error("Error adding calendar or sending notification:", error);

    return {
      error: "Failed to edit calendar name. Please try again later",
      status: API_STATUS.FAILED,
      message: "",
      data: null,
      extra: null,
    };
  }
};

export const denyCalendarRequest = async (data: {
  userId: string;
  notificationId: string;
}): Promise<ApiResponse<boolean>> => {
  try {
    const { userId, notificationId } = data; // Destructure the data parameter
    const docRef = doc(db, `users/${userId}/notifications/${notificationId}`);

    const notificationDoc = await getDoc(docRef);
    if (!notificationDoc.exists()) {
      return {
        error: "The calendar notification does not exist",
        status: API_STATUS.FAILED,
        message: "",
        data: null,
        extra: null,
      };
    }

    await deleteDoc(docRef);

    return {
      error: "",
      status: API_STATUS.SUCCESS,
      message: `Notification successfully deleted!`,
      data: true, // Return `true` to indicate successful deletion
      extra: null,
    };
  } catch (error) {
    console.error("Error adding calendar or sending notification:", error);

    return {
      error: "Failed to delete notification. Please try again later.", // Adjusted the error message
      status: API_STATUS.FAILED,
      message: "",
      data: false,
      extra: null,
    };
  }
};

export const acceptCalendarRequest = async (
  userId: string,
  notificationId: string,
  clientNotification: ClientNotification,
): Promise<ApiResponse<boolean>> => {
  try {
    const { requestingUserId, targetCalendarId } = clientNotification;

    const calendarDocRef = doc(db, `calendars/${targetCalendarId}`);

    const calendarDoc = await getDoc(calendarDocRef);
    if (!calendarDoc.exists()) {
      return {
        error: "The calendar does not exist",
        status: API_STATUS.FAILED,
        message: "",
        data: false,
        extra: null,
      };
    }

    await updateDoc(calendarDocRef, {
      members: arrayUnion(requestingUserId),
    });

    const notificationDocRef = doc(
      db,
      `users/${userId}/notifications/${notificationId}`,
    );
    await deleteDoc(notificationDocRef);

    return {
      error: "",
      status: API_STATUS.SUCCESS,
      message: `Notification ${notificationId} successfully accepted!`,
      data: true,
      extra: null,
    };
  } catch (error) {
    console.error("Error adding calendar or sending notification:", error);

    return {
      error: "Failed to process the calendar request. Please try again later.",
      status: API_STATUS.FAILED,
      message: "",
      data: false,
      extra: null,
    };
  }
};

export const removeMember = async (
  memberId: string,
  calendarId: string,
): Promise<ApiResponse<boolean>> => {
  try {
    const docRef = doc(db, `calendars/${calendarId}`);

    const calendarDoc = await getDoc(docRef);
    if (!calendarDoc.exists()) {
      return {
        error: "The calendar no longer exists",
        status: API_STATUS.FAILED,
        message: "The calendar no longer exists",
        data: null,
        extra: null,
      };
    }

    await updateDoc(docRef, {
      members: arrayRemove(memberId),
    });

    return {
      error: "",
      status: API_STATUS.SUCCESS,
      message: `Member ${memberId} successfully removed from calendar.`,
      data: true,
      extra: null,
    };
  } catch (error) {
    console.error("Error adding calendar or sending notification:", error);

    return {
      error: "Failed to remove the member. Please try again later.",
      status: API_STATUS.FAILED,
      message: "Failed to remove the member. Please try again later.",
      data: false,
      extra: null,
    };
  }
};
