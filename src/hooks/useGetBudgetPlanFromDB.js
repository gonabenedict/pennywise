import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useGetBudgetPlanFromDB = () => {
    const { userID } = useGetUserInfo();
    
    const getBudgetPlan = async (monthKey) => {
        if (!userID) {
            console.error("User not authenticated - cannot fetch budget plan");
            return null;
        }
        
        try {
            console.log(`Fetching budget plan for user ${userID}, month ${monthKey}`);
            const budgetDocRef = doc(db, "budgetPlans", `${userID}_${monthKey}`);
            const docSnap = await getDoc(budgetDocRef);
            
            if (docSnap.exists()) {
                console.log("Budget plan found in Firestore:", docSnap.data().categories);
                return docSnap.data().categories;
            }
            console.log("No budget plan found in Firestore for this month");
            return null;
        } catch (error) {
            console.error("Error fetching budget plan:", error);
            return null;
        }
    };

    return { getBudgetPlan };
};
