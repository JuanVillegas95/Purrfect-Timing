"use server";
import { UserPlan } from "@utils/types";
import { INTIAL_RANGE, API_STATUS } from "@utils/constants";
import {
  formatDateToISO,
  getISORange,
  localTimeZone,
  newApiResponse,
  newClientUser,
  newDBCalendar,
  newDBUser,
} from "@utils/functions";
import {
  Event,
  Range,
  ApiResponse,
  DBUser,
  ClientCalendar,
  ClientUser,
  ClientNotification,
  DBCalendar,
} from "@utils/interfaces";

import { adminAuth, adminDb } from "@db/firebaseAdmin";
import { fromZonedTime } from "date-fns-tz";
import { auth } from "@db/firebaseClient";
import { cookies } from "next/headers";
import { generateUserId } from "./clientActions";

export const createSession = async (
  uid: string,
  email: string,
  userName: string,
  jwtToken: string,
): Promise<ApiResponse<ClientUser>> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    (await cookies()).set("jwtToken", jwtToken, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
    });
    const user = await adminDb.collection("users").doc(uid).get();
    if (userName === "guest") {
      return newApiResponse(
        API_STATUS.SUCCESS,
        "Guest user session created successfully",
        "",
        newClientUser(newDBUser(userName, email, "0"), uid),
      );
    } else if (!user.exists) {
      const newCalendar: DBCalendar = newDBCalendar(uid);
      const newCalendarDocRef = await adminDb
        .collection("calendars")
        .add(newCalendar);

      const newUser: DBUser = newDBUser(userName, email, newCalendarDocRef.id);
      await adminDb.collection("users").doc(uid).set(newUser);

      return newApiResponse(
        API_STATUS.SUCCESS,
        "New user session created successfully",
        "",
        newClientUser(newUser, uid),
      );
    }
    const existingUser = user.data() as DBUser;
    return newApiResponse(
      API_STATUS.SUCCESS,
      "Existent user session created successfully",
      "",
      newClientUser(existingUser, uid),
    );
  } catch (error) {
    return newApiResponse(
      API_STATUS.FAILED,
      "",
      error instanceof Error
        ? error.message
        : "An error occurred while accessing the database service. Please try again later",
    );
  }
};

export const deleteSession = async (): Promise<ApiResponse<boolean>> => {
  try {
    (await cookies()).delete("jwtToken");
    return newApiResponse(
      API_STATUS.SUCCESS,
      "Logged out successfully. See you again!",
    );
  } catch (error) {
    return newApiResponse(
      API_STATUS.FAILED,
      "",
      error instanceof Error
        ? error.message
        : "An error occurred while accessing the database service. Please try again later",
    );
  }
};

export const generateCustomToken = async (): Promise<ApiResponse<string>> => {
  try {
    const additionalClaims = {
      displayName: "guest",
      email: "guest@email.com",
    };

    const customToken = await adminAuth.createCustomToken(
      "lYR7c4NilW4bJUHdfu7X",
      additionalClaims,
    );

    return newApiResponse(
      API_STATUS.SUCCESS,
      "Custom token generated successfully",
      "",
      customToken,
    );
  } catch (error) {
    return newApiResponse(
      API_STATUS.FAILED,
      "",
      error instanceof Error
        ? error.message
        : "An error occurred while accessing the database service. Please try again later",
    );
  }
};

export const initialFetch = async (): Promise<ApiResponse<string>> => {
  try {
    const jwtToken = (await cookies()).get("jwtToken")?.value;
    if (!jwtToken) {
      return newApiResponse(
        API_STATUS.FAILED,
        "Authentication failed",
        "No session token found during the inital fetch.",
      );
    }
    const user = await adminAuth.verifyIdToken(jwtToken);
    if (user && user.email && user.email === "guest@email.com")
      return newApiResponse(API_STATUS.SUCCESS, "Welcome back", "", "0");

    const userId: string = user.uid;

    const firstCalendarIdSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .get();

    if (!firstCalendarIdSnapshot.exists) {
      return newApiResponse(
        API_STATUS.FAILED,
        "User not found",
        `No user associated with user ID: ${userId} during inital fetching. Please contact support.`,
      );
    }

    const userData = firstCalendarIdSnapshot.data();
    if (
      !userData ||
      !userData.calendarIds ||
      !Array.isArray(userData.calendarIds) ||
      userData.calendarIds.length === 0
    ) {
      return newApiResponse(
        API_STATUS.FAILED,
        "No calendars found",
        "The user is not associated with any calendars during inital fetching. Please contact support.",
      );
    }

    const firstCalendarId = userData.calendarIds[0];

    return newApiResponse(
      API_STATUS.SUCCESS,
      "Welcome back",
      "",
      firstCalendarId,
    );
  } catch (error) {
    return newApiResponse(
      API_STATUS.FAILED,
      "Server error",
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching user information.",
    );
  }
};

// const localRange = getISORange(INTIAL_RANGE, localTimeZone());
// const range: Range = {
//   start: formatDateToISO(fromZonedTime(localRange.start, localTimeZone())),
//   end: formatDateToISO(fromZonedTime(localRange.end, localTimeZone())),
// };

// const standaloneSnapshot = await eventsRef
//   .where("startDate", ">=", range.start)
//   .where("startDate", "<=", range.end)
//   .where("endDate", "==", null)
//   .get();

// const recurringSnapshot = await eventsRef
//   .where("startDate", "<=", range.end)
//   .where("endDate", ">=", range.start)
//   .get();
