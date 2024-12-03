"use server";
import { db } from "@/config/firebase";
import { doc, setDoc, getDoc, DocumentData } from "firebase/firestore";

// export async function getCalendarKeys(): Promise<string[]> {
//     try {
//         const userDocRef = doc(db, "users", USER_EMAIL);
//         const userDoc = await getDoc(userDocRef);

//         if (!userDoc.exists()) {
//             console.log("User not found!");
//             return [];
//         }

//         const userData: DocumentData = userDoc.data()!;

//         const calendarKeys = Object.keys(userData.calendars || {});

//         console.log("Calendar Keys:", calendarKeys);
//         return calendarKeys;
//     } catch (error) {
//         console.error("Error fetching calendar keys:", error);
//         throw error;
//     }
// }


