// app/server/Friends/Friends.tsx
import React from 'react';
// import { db } from "@config/firebase"
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { USER_ID } from '@utils/constants';

export const FriendCards = async () => {
    // const fetchFriends = async (): Promise<any[]> => {
    //     "use server"
    //     try {
    //         const userDocRef = doc(db, "users", USER_ID); // Reference the user document
    //         const userDoc = await getDoc(userDocRef); // Get the document

    //         if (!userDoc.exists()) return []; // If the document doesn't exist, return an empty array

    //         const userData: DocumentData = userDoc.data()!;
    //         const friends = userData.friends || []; // Retrieve the "friends" array

    //         if (friends.length === 0) return []; // If no friends, return an empty array

    //         const usersCollection = collection(db, "users"); // Reference the users collection
    //         const friendsQuery = query(usersCollection, where("__name__", "in", friends)); // Query documents by IDs
    //         const friendsSnapshot = await getDocs(friendsQuery);

    //         const friendsData: any[] = [];
    //         friendsSnapshot.forEach((doc) => {
    //             friendsData.push({ id: doc.id, username: doc.data().username }); // Push ID and username
    //         });

    //         return friendsData;
    //     } catch (error) {
    //         console.error("Error fetching friends data:", error);
    //         throw error;
    //     }
    // };

    // const friends: any[] = await fetchFriends();

    return <div></div>

};
