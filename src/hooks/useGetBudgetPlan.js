import { useEffect, useState } from 'react';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useGetUserInfo } from "./useGetUserInfo";

export const useGetBudgetPlan = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userID } = useGetUserInfo();
    
    useEffect(() => {
        const loadBudgetPlan = async () => {
            setIsLoading(true);
            try {
                // Get current month key
                const today = new Date();
                const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                
                console.log(`Loading budget plan - userID: ${userID}, monthKey: ${monthKey}`);
                
                if (userID) {
                    // Try to fetch from Firebase first
                    const budgetDocRef = doc(db, "budgetPlans", `${userID}_${monthKey}`);
                    const docSnap = await getDoc(budgetDocRef);
                    
                    if (docSnap.exists()) {
                        console.log("Budget plan loaded from Firebase:", docSnap.data().categories);
                        setCategories(docSnap.data().categories || []);
                        return;
                    }
                }
                
                // Fallback to localStorage if Firebase data not found
                console.log("Firebase budget plan not found, checking localStorage");
                const budgetDraft = localStorage.getItem("budgetDraft");
                if (budgetDraft) {
                    const parsedCategories = JSON.parse(budgetDraft);
                    console.log("Budget plan loaded from localStorage:", parsedCategories);
                    setCategories(parsedCategories);
                } else {
                    console.log("No budget plan found anywhere");
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error loading budget plan:", error);
                // Fallback to localStorage on error
                try {
                    const budgetDraft = localStorage.getItem("budgetDraft");
                    if (budgetDraft) {
                        const parsedCategories = JSON.parse(budgetDraft);
                        console.log("Budget plan loaded from localStorage (fallback):", parsedCategories);
                        setCategories(parsedCategories);
                    } else {
                        setCategories([]);
                    }
                } catch (parseError) {
                    console.error("Error parsing budget plan:", parseError);
                    setCategories([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        loadBudgetPlan();
    }, [userID]);
    
    return { categories, isLoading };
};
