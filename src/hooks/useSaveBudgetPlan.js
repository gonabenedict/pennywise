import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useSaveBudgetPlan = () => {
    const { userID } = useGetUserInfo();
    
    const saveBudgetPlan = async (categories, monthKey) => {
        if (!userID) {
            console.error("User not authenticated - cannot save budget plan");
            return false;
        }
        
        try {
            console.log(`Saving budget plan for user ${userID}, month ${monthKey}:`, categories);
            const budgetDocRef = doc(db, "budgetPlans", `${userID}_${monthKey}`);
            await setDoc(budgetDocRef, {
                userID,
                monthKey,
                categories,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            console.log("Budget plan saved successfully to Firestore");
            return true;
        } catch (error) {
            console.error("Error saving budget plan:", error);
            return false;
        }
    };

    return { saveBudgetPlan };
};
