import { db } from "@config/firebase";
import { collection, getDocs } from "firebase/firestore";

import { USER_ID } from "@utils/constants";

// export const fetchUsers = async () => {
//   try {
//     const userRef = getref(db, "users", USER_ID);
//     const snapshot = await getDocs(usersCollection);
//     const users = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     return users;
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw error;
//   }
// };
