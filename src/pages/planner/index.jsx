import { useState, useEffect } from 'react';
import { useMonthlyCheck } from "../../hooks/useMonthlyCheck";
import { useSaveBudgetPlan } from "../../hooks/useSaveBudgetPlan";
import { useGetBudgetPlanFromDB } from "../../hooks/useGetBudgetPlanFromDB";
import { Sidebar } from '../../components/Sidebar';
import { MonthlyPrompt } from '../../components/MonthlyPrompt';
import './styles.css';

const CATEGORY_ICONS = {
    'food': { icon: 'restaurant', color: '#ff6b6b' },
    'rent': { icon: 'home', color: '#0d7377' },
    'transport': { icon: 'directions_car', color: '#4ecdc4' },
    'utilities': { icon: 'bolt', color: '#ffd93d' },
    'entertainment': { icon: 'theater_comedy', color: '#95e1d3' },
    'savings': { icon: 'savings', color: '#6bcf7f' },
    'healthcare': { icon: 'local_hospital', color: '#ff8b94' },
    'shopping': { icon: 'shopping_bag', color: '#c7ceea' },
    'education': { icon: 'school', color: '#b4a7d6' },
    'other': { icon: 'category', color: '#a0c4ff' }
};

export const Planner = () => {
    const { isEndOfMonth, currentMonth, getCurrentMonthKey, saveCurrentMonth, setIsEndOfMonth } = useMonthlyCheck();
    const { saveBudgetPlan } = useSaveBudgetPlan();
    const { getBudgetPlan } = useGetBudgetPlanFromDB();
    
    const [categories, setCategories] = useState([]);
    const [draftSaved, setDraftSaved] = useState(false);
    const [message, setMessage] = useState('');
    const [showMonthlyPrompt, setShowMonthlyPrompt] = useState(false);
    const [previousMonthPlan, setPreviousMonthPlan] = useState(null);

    // Load draft from Firebase on mount
    useEffect(() => {
        const loadBudgetPlan = async () => {
            const savedMonth = localStorage.getItem('currentMonth');
            const currentMonthKey = getCurrentMonthKey();
            
            try {
                // Try to fetch from Firebase first
                const firebaseData = await getBudgetPlan(currentMonthKey);
                
                if (firebaseData) {
                    // If this is a new month, save the previous plan and show prompt
                    if (savedMonth && savedMonth !== currentMonthKey && isEndOfMonth) {
                        setPreviousMonthPlan(firebaseData);
                        setShowMonthlyPrompt(true);
                    } else if (!savedMonth) {
                        // First time using the app
                        saveCurrentMonth();
                        setCategories(firebaseData);
                    } else {
                        // Same month
                        setCategories(firebaseData);
                    }
                } else if (!savedMonth) {
                    // No Firebase data, start fresh
                    saveCurrentMonth();
                    setCategories([]);
                } else {
                    // Try fallback to localStorage for offline support
                    const savedDraft = localStorage.getItem('budgetDraft');
                    if (savedDraft) {
                        const draftData = JSON.parse(savedDraft);
                        setCategories(draftData);
                    }
                }
            } catch (error) {
                console.error("Error loading budget plan:", error);
                // Fallback to localStorage if Firebase fails
                const savedDraft = localStorage.getItem('budgetDraft');
                if (savedDraft) {
                    try {
                        const draftData = JSON.parse(savedDraft);
                        if (savedMonth && savedMonth !== currentMonthKey && isEndOfMonth) {
                            setPreviousMonthPlan(draftData);
                            setShowMonthlyPrompt(true);
                        } else {
                            setCategories(draftData);
                        }
                    } catch (parseError) {
                        console.error("Error parsing localStorage draft:", parseError);
                    }
                }
            }
        };

        loadBudgetPlan();
    }, [currentMonth, getCurrentMonthKey, isEndOfMonth, saveCurrentMonth, getBudgetPlan]);

    const handleKeepPlan = async () => {
        // Archive previous month's plan
        const previousMonth = localStorage.getItem('currentMonth');
        if (previousMonthPlan && previousMonth) {
            const archivedPlans = JSON.parse(localStorage.getItem('archivedPlans') || '{}');
            archivedPlans[previousMonth] = previousMonthPlan;
            localStorage.setItem('archivedPlans', JSON.stringify(archivedPlans));
        }
        
        // Keep the same categories but reset for new month
        const newCategories = previousMonthPlan.map(cat => ({
            ...cat,
            // Keep amounts but they start fresh for new month
        }));
        
        setCategories(newCategories);
        
        // Save to both localStorage and Firebase
        localStorage.setItem('budgetDraft', JSON.stringify(newCategories));
        await saveBudgetPlan(newCategories, getCurrentMonthKey());
        
        saveCurrentMonth();
        setShowMonthlyPrompt(false);
        setIsEndOfMonth(false);
        setPreviousMonthPlan(null);
        setMessage('✓ Plan carried forward to new month!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleChangePlan = async () => {
        // Archive previous month's plan
        const previousMonth = localStorage.getItem('currentMonth');
        if (previousMonthPlan && previousMonth) {
            const archivedPlans = JSON.parse(localStorage.getItem('archivedPlans') || '{}');
            archivedPlans[previousMonth] = previousMonthPlan;
            localStorage.setItem('archivedPlans', JSON.stringify(archivedPlans));
        }
        
        // Start fresh with empty categories
        setCategories([]);
        localStorage.removeItem('budgetDraft');
        
        // Clear Firebase data for this month
        await saveBudgetPlan([], getCurrentMonthKey());
        
        saveCurrentMonth();
        setShowMonthlyPrompt(false);
        setIsEndOfMonth(false);
        setPreviousMonthPlan(null);
        setMessage('✓ Starting fresh with new month!');
        setTimeout(() => setMessage(''), 3000);
    };

    const addCategory = () => {
        const newCategory = {
            id: Date.now(),
            name: '',
            amount: 0,
            icon: 'other',
            type: 'expense',
            description: ''
        };
        setCategories([...categories, newCategory]);
    };

    const removeCategory = async (id) => {
        const updatedCategories = categories.filter(cat => cat.id !== id);
        setCategories(updatedCategories);
        
        // Save the updated categories to Firebase
        try {
            const success = await saveBudgetPlan(updatedCategories, getCurrentMonthKey());
            if (success) {
                // Also update localStorage for offline support
                localStorage.setItem('budgetDraft', JSON.stringify(updatedCategories));
                setMessage('✓ Category deleted successfully!');
                setTimeout(() => setMessage(''), 2000);
            } else {
                setMessage('⚠ Category deleted locally, but failed to sync with database');
                setTimeout(() => setMessage(''), 2000);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setMessage('⚠ Category deleted locally, but failed to sync with database');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const updateCategory = (id, field, value) => {
        const updatedCategories = categories.map(cat => 
            cat.id === id ? { ...cat, [field]: value } : cat
        );
        setCategories(updatedCategories);
        
        // Auto-save to Firebase when category is updated
        // Use a small debounce to avoid too many database calls
        clearTimeout(window.updateCategoryTimeout);
        window.updateCategoryTimeout = setTimeout(async () => {
            try {
                const success = await saveBudgetPlan(updatedCategories, getCurrentMonthKey());
                if (success) {
                    // Also update localStorage for offline support
                    localStorage.setItem('budgetDraft', JSON.stringify(updatedCategories));
                    console.log('Category updated and saved to Firebase');
                }
            } catch (error) {
                console.error('Error auto-saving category update:', error);
            }
        }, 1000); // Wait 1 second after last edit before saving
    };

    const saveDraft = async () => {
        if (categories.length === 0) {
            setMessage('Please add at least one category');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const allCategoriesFilled = categories.every(cat => cat.name.trim() && cat.amount > 0);
        if (!allCategoriesFilled) {
            setMessage('Please fill in all category names and amounts');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Save to both localStorage (for offline support) and Firebase (for persistence)
        localStorage.setItem('budgetDraft', JSON.stringify(categories));
        
        try {
            const success = await saveBudgetPlan(categories, getCurrentMonthKey());
            if (success) {
                setMessage('✓ Budget draft saved successfully!');
            } else {
                setMessage('⚠ Saved locally, but failed to sync with database');
            }
        } catch (error) {
            console.error('Error saving budget plan:', error);
            setMessage('⚠ Saved locally, but failed to sync with database');
        }
        
        setDraftSaved(true);
        setTimeout(() => {
            setMessage('');
            setDraftSaved(false);
        }, 3000);
    };

    const totalIncome = categories
        .filter(cat => cat.type === 'income')
        .reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0);
    
    const totalExpenses = categories
        .filter(cat => cat.type === 'expense')
        .reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0);
    
    const remaining = totalIncome - totalExpenses;

    const getIconStyle = (categoryName) => {
        const key = categoryName.toLowerCase().split(' ')[0];
        return CATEGORY_ICONS[key] || CATEGORY_ICONS['other'];
    };

    const getFormattedMonth = () => {
        if (!currentMonth) return '';
        const [year, month] = currentMonth.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="planner-wrapper">
            <Sidebar />
            <MonthlyPrompt 
                isOpen={showMonthlyPrompt}
                currentMonth={previousMonthPlan ? localStorage.getItem('currentMonth') : currentMonth}
                onKeepPlan={handleKeepPlan}
                onChangePlan={handleChangePlan}
            />
            <div className="planner-main">
                <header className="planner-top-bar">
                    <div className="planner-title-section">
                        <h2 className="planner-title">Monthly Planner</h2>
                        <p className="planner-month-subtitle">Drafting budget for {getFormattedMonth()}</p>
                    </div>
                    <div className="planner-header-actions">
                        <div className="planner-search-box">
                            <span className="planner-search-icon material-symbols-outlined">search</span>
                            <input 
                                className="planner-search-input"
                                placeholder="Search categories..." 
                                type="text"
                            />
                        </div>
                        <div className="planner-icon-buttons">
                            <button className="planner-icon-btn" title="Notifications">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <button className="planner-icon-btn" title="Settings">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="planner-content-wrapper">
                    <div className="planner-save-btn-container">
                        <button 
                            className="save-plan-btn"
                            onClick={saveDraft}
                            title="Save Plan"
                        >
                            Save Plan
                        </button>
                    </div>

                    <div className="planner-content">
                    <div className="consolidated-overview">
                        <div className="overview-content">
                            <p className="overview-label">CONSOLIDATED OVERVIEW</p>
                            <div className="overview-main">
                                <div className="total-planned">
                                    <span className="total-amount">${totalIncome.toFixed(2)}</span>
                                    <span className="total-label">Total Income</span>
                                </div>
                                <div className="overview-details">
                                    <p className="income-detail">Expenses: ${totalExpenses.toFixed(2)}</p>
                                    <p className={`remaining-detail ${remaining >= 0 ? 'surplus' : 'deficit'}`}>
                                        {remaining >= 0 ? 'Surplus' : 'Deficit'}: ${Math.abs(remaining).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="categories-section">
                        <div className="categories-header">
                            <h2>Allocation Categories</h2>
                            <p className="categories-hint">Click values to edit</p>
                        </div>

                        {categories.length === 0 ? (
                            <div className="empty-categories">
                                <p>No categories added yet</p>
                                <p className="empty-subtitle">Click "Add Category" to start building your budget</p>
                            </div>
                        ) : (
                            <div className="categories-grid">
                                {categories.map((category) => {
                                    const iconStyle = getIconStyle(category.name);
                                    const percentage = totalIncome > 0 ? ((category.amount / totalIncome) * 100).toFixed(1) : 0;
                                    return (
                                        <div key={category.id} className="category-card">
                                            <div className="card-header">
                                                <div 
                                                    className="category-icon"
                                                    style={{ backgroundColor: iconStyle.color }}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        {iconStyle.icon}
                                                    </span>
                                                </div>
                                                <button
                                                    className="close-btn"
                                                    onClick={() => removeCategory(category.id)}
                                                    title="Remove category"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            
                                            <div className="card-content">
                                                <input
                                                    type="text"
                                                    placeholder="Category name"
                                                    value={category.name}
                                                    onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                                                    className="category-name-input"
                                                />

                                                <input
                                                    type="text"
                                                    placeholder="Description (optional)"
                                                    value={category.description || ''}
                                                    onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                                                    className="category-description-input"
                                                />

                                                <div className="type-toggle">
                                                    <button
                                                        className={`type-btn ${category.type === 'income' ? 'active' : ''}`}
                                                        onClick={() => updateCategory(category.id, 'type', 'income')}
                                                    >
                                                        Income
                                                    </button>
                                                    <button
                                                        className={`type-btn ${category.type === 'expense' ? 'active' : ''}`}
                                                        onClick={() => updateCategory(category.id, 'type', 'expense')}
                                                    >
                                                        Expense
                                                    </button>
                                                </div>
                                                
                                                <div className="card-amount">
                                                    <span className="currency">$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={category.amount || ''}
                                                        onChange={(e) => updateCategory(category.id, 'amount', parseFloat(e.target.value) || 0)}
                                                        className="amount-value"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="card-footer">
                                                    <span className="percentage">{percentage}% of total income</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button className="add-category-btn" onClick={addCategory}>
                            <span className="material-symbols-outlined">add</span>
                            Add Category
                        </button>
                    </div>

                    {message && (
                        <div className={`message ${draftSaved ? 'success' : ''}`}>
                            {message}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}
