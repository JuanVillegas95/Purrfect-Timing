// "use server";

// import { doc, setDoc, getDoc, DocumentData, query, where, getDocs, collection } from "firebase/firestore";
// import {db}
// import { USER_ID } from "@/utils/constants";

// export async function friendsData(): Promise<{ id: string, username: string }[]> {
//     try {
//         const userDocRef = doc(db, "users", USER_ID);
//         const userDoc = await getDoc(userDocRef);

//         if (!userDoc.exists()) return [];

//         const userData: DocumentData = userDoc.data()!;
//         const friends = userData.friends || [];


//         const usersCollection = collection(db, "users");
//         const friendsQuery = query(usersCollection, where("__name__", "in", friends));
//         const friendsSnapshot = await getDocs(friendsQuery);
//         const friendsData: { id: string, username: string }[] = [];

//         friendsSnapshot.forEach((doc) => {
//             friendsData.push({ id: doc.id, username: doc.data().username });
//         });

//         return friendsData;
//     } catch (error) {
//         console.error("Error fetching calendar keys:", error);
//         throw error;
//     }
// }


