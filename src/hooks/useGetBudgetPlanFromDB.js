import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useGetBudgetPlanFromDB = () => {
    const { userID } = useGetUserInfo();
    
    const getBudgetPlan = async (monthKey) => {
        if (!userID) {
            console.error("User not authenticated");
            return null;
        }
        
        try {
            const budgetDocRef = doc(db, "budgetPlans", `${userID}_${monthKey}`);
            const docSnap = await getDoc(budgetDocRef);
            
            if (docSnap.exists()) {
                return docSnap.data().categories;
            }
            return null;
        } catch (error) {
            console.error("Error fetching budget plan:", error);
            return null;
        }
    };

    return { getBudgetPlan };
};
