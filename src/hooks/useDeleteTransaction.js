import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useDeleteTransaction = () => {
    const deleteTransaction = async (transactionId) => {
        if (!transactionId) {
            console.error("Transaction ID not provided");
            throw new Error("Transaction ID not provided");
        }

        try {
            await deleteDoc(doc(db, "transactions", transactionId));
            console.log(`Successfully deleted transaction ${transactionId}`);
        } catch (error) {
            console.error("Error deleting transaction:", error);
            throw error;
        }
    };

    return { deleteTransaction };
};
