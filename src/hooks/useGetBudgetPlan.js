export const useGetBudgetPlan = () => {
    try {
        const budgetDraft = localStorage.getItem("budgetDraft");
        if (budgetDraft) {
            const categories = JSON.parse(budgetDraft);
            return categories;
        }
    } catch (error) {
        console.error("Error parsing budget plan:", error);
    }
    
    return [];
};
