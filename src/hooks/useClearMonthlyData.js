import { query, collection, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useClearMonthlyData = () => {
    const { userID } = useGetUserInfo();

    const clearMonthlyData = async () => {
        if (!userID) {
            console.error("User ID not found");
            throw new Error("User ID not found");
        }

        try {
            // Query ALL transactions for this user (not filtered by month)
            const transactionCollectionRef = collection(db, "transactions");
            const queryTransactions = query(
                transactionCollectionRef,
                where("userID", "==", userID)
            );

            const snapshot = await getDocs(queryTransactions);

            // Delete all transactions for the user
            const deletePromises = [];
            snapshot.forEach((docSnapshot) => {
                deletePromises.push(deleteDoc(doc(db, "transactions", docSnapshot.id)));
            });

            // Wait for all deletions to complete
            await Promise.all(deletePromises);
            console.log(`Deleted ${deletePromises.length} total transactions for user`);
            return deletePromises.length;

        } catch (error) {
            console.error("Error clearing user data:", error);
            throw error;
        }
    };

    return { clearMonthlyData };
};
