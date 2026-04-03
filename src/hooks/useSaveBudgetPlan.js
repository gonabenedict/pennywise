import { setDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useSaveBudgetPlan = () => {
    const { userID } = useGetUserInfo();
    
    const saveBudgetPlan = async (categories, monthKey) => {
        if (!userID) {
            console.error("User not authenticated");
            return false;
        }
        
        try {
            const budgetDocRef = doc(db, "budgetPlans", `${userID}_${monthKey}`);
            await setDoc(budgetDocRef, {
                userID,
                monthKey,
                categories,
                updatedAt: new Date(),
            }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error saving budget plan:", error);
            return false;
        }
    };

    return { saveBudgetPlan };
};
