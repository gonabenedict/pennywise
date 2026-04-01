import { useEffect, useState } from 'react';

export const useMonthlyCheck = () => {
    const [isEndOfMonth, setIsEndOfMonth] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(null);

    useEffect(() => {
        const checkMonthStatus = () => {
            const today = new Date();
            const currentDay = today.getDate();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            
            // Last day of month (within 2 days)
            const isEndOfMonthPeriod = currentDay >= daysInMonth - 1;
            
            const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const savedMonth = localStorage.getItem('currentMonth');
            
            // If month changed, show end-of-month prompt
            if (savedMonth && savedMonth !== monthKey && isEndOfMonthPeriod) {
                setIsEndOfMonth(true);
            }
            
            setCurrentMonth(monthKey);
        };

        checkMonthStatus();
        const interval = setInterval(checkMonthStatus, 60000); // Check every minute
        
        return () => clearInterval(interval);
    }, []);

    const getCurrentMonthKey = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    };

    const saveCurrentMonth = () => {
        localStorage.setItem('currentMonth', getCurrentMonthKey());
    };

    return { isEndOfMonth, currentMonth, getCurrentMonthKey, saveCurrentMonth, setIsEndOfMonth };
};
