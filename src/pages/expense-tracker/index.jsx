import { useState, useEffect } from 'react';
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import { useGetBudgetPlan } from "../../hooks/useGetBudgetPlan";
import { useClearMonthlyData } from "../../hooks/useClearMonthlyData";
import { useMonthlyCheck } from "../../hooks/useMonthlyCheck";
import { Sidebar } from '../../components/Sidebar';
import './styles.css';

const getCategoryIcon = (category) => {
    const iconMap = {
        'groceries': 'shopping_bag',
        'food': 'restaurant',
        'dining': 'restaurant',
        'utilities': 'bolt',
        'housing': 'home',
        'rent': 'home',
        'transport': 'directions_car',
        'gas': 'directions_car',
        'entertainment': 'theater_comedy',
        'salary': 'payments',
        'income': 'payments',
        'shopping': 'shopping_cart',
        'healthcare': 'local_hospital',
        'education': 'school',
    };
    const key = category?.toLowerCase() || 'category';
    return iconMap[key] || 'category';
};

export const ExpenseTracker = () => {
    const { transactions, transactionsTotals } = useGetTransactions();
    const { name, profilePhoto } = useGetUserInfo();
    const budgetPlan = useGetBudgetPlan();
    const { clearMonthlyData } = useClearMonthlyData();
    const { currentMonth } = useMonthlyCheck();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize month on first load
    useEffect(() => {
        const savedMonth = localStorage.getItem('currentMonth');
        if (!savedMonth) {
            const today = new Date();
            const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            localStorage.setItem('currentMonth', monthKey);
        }
    }, []);

    const { income, expenses } = transactionsTotals;

    // Format current month for display
    const getFormattedMonth = () => {
        if (!currentMonth) return '';
        const [year, month] = currentMonth.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    // Calculate planned income from budget plan
    const plannedIncome = budgetPlan
        .filter(cat => cat.type === 'income')
        .reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0);

    // Total income includes both planned and transaction-based income
    const totalIncome = income + plannedIncome;

    // Net remaining is the difference between total income and expenses
    const netRemaining = totalIncome - expenses;

    // Calculate spending by category
    const calculateCategorySpending = () => {
        const spendingByCategory = {};
        
        if (transactions) {
            transactions.forEach((transaction) => {
                const category = transaction.category || "Uncategorized";
                if (!spendingByCategory[category]) {
                    spendingByCategory[category] = 0;
                }
                if (transaction.transactionType === "expense") {
                    spendingByCategory[category] += parseFloat(transaction.transactionAmount) || 0;
                }
            });
        }
        
        return spendingByCategory;
    };

    const spendingByCategory = calculateCategorySpending();

    // Get category breakdown with budget and actual spending
    const getCategoryBreakdown = () => {
        // Only show expense categories in the breakdown
        const expenseCategories = budgetPlan.filter(cat => cat.type === 'expense');
        
        return expenseCategories.map((budgetCategory) => {
            const spent = spendingByCategory[budgetCategory.name] || 0;
            const remaining = budgetCategory.amount - spent;
            const percentage = budgetCategory.amount > 0 ? (spent / budgetCategory.amount) * 100 : 0;
            
            return {
                ...budgetCategory,
                spent,
                remaining,
                percentage: Math.min(percentage, 100)
            };
        });
    };

    const categoryBreakdown = getCategoryBreakdown();

    const clearData = async () => {
        if (window.confirm('Are you sure you want to clear ALL your data? This action cannot be undone and will permanently delete all transactions from the database.')) {
            setIsLoading(true);
            try {
                const deletedCount = await clearMonthlyData();
                localStorage.removeItem('budgetDraft');
                setMessage(`✓ Successfully deleted ${deletedCount} transactions. All data cleared!`);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (error) {
                setMessage(`✗ Error clearing data: ${error.message}`);
                setTimeout(() => setMessage(''), 3000);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="expense-tracker-wrapper">
            <Sidebar />
            <div className="expense-tracker">
                <div className="page-wrapper">
                    <header className="dashboard-header">
                        <div className="header-info">
                            <h2>{getFormattedMonth()}</h2>
                            <p>Your financial health is looking steady.</p>
                        </div>
                        <div className="header-actions">
                            <div className="search-container">
                                <span className="search-icon material-symbols-outlined">search</span>
                                <input 
                                    className="search-input" 
                                    placeholder="Search transactions..." 
                                    type="text"
                                />
                            </div>
                            <div className="action-buttons">
                                <button className="icon-button" title="Notifications">
                                    <span className="material-symbols-outlined">notifications</span>
                                </button>
                                <button 
                                    className="icon-button" 
                                    onClick={clearData}
                                    disabled={isLoading}
                                    title="Clear all data permanently"
                                >
                                    <span className="material-symbols-outlined">delete_sweep</span>
                                </button>
                            </div>
                        </div>
                    </header>
                    <div className="container">
                        <div className="balance">
                            <h3> Net Remaining</h3>
                            {netRemaining >= 0 ? (
                                <h2>${netRemaining.toFixed(2)}</h2>
                            ) : (
                                <h2>-${Math.abs(netRemaining).toFixed(2)}</h2>
                            )}
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${Math.min((netRemaining / totalIncome) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <div className="income">
                            <h4>Total Income</h4>
                            <p>${totalIncome.toFixed(2)}</p>
                        </div>
                        <div className="expenses">
                            <h4> Total Spent </h4>
                            <p>${expenses.toFixed(2)}</p>
                        </div>
                    </div>

                    {categoryBreakdown.length > 0 && (
                        <section className="spending-section">
                            <div className="section-header">
                                <div>
                                    <h2>Spending Buckets</h2>
                                </div>
                            </div>
                            
                            <div className="categories-grid">
                                {categoryBreakdown.map((category, index) => {
                                    const iconClasses = ['primary', 'secondary', 'tertiary', 'accent'];
                                    const iconClass = iconClasses[index % iconClasses.length];
                                    
                                    const isFullyAllocated = category.remaining <= 0 && category.percentage >= 100;
                                    const isLowFunds = category.remaining < category.amount * 0.1 && category.remaining > 0;
                                    const statusText = isFullyAllocated 
                                        ? 'Fully Allocated' 
                                        : isLowFunds 
                                            ? 'Low Funds Alert' 
                                            : `${category.percentage.toFixed(0)}% Spent`;
                                    
                                    return (
                                        <div key={category.id} className="category-bucket">
                                            <div className="bucket-header">
                                                <div className={`bucket-icon ${iconClass}`}>
                                                    <span className="material-symbols-outlined">
                                                        {getCategoryIcon(category.name)}
                                                    </span>
                                                </div>
                                                <div className="bucket-remaining">
                                                    <p className="remaining-label">Remaining</p>
                                                    <p className={`remaining-amount ${category.remaining < 0 ? 'negative' : ''}`}>
                                                        ${category.remaining.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <h4 className="bucket-name">{category.name}</h4>
                                            <p className="bucket-spending">${category.spent.toFixed(2)} of ${category.amount.toFixed(2)}</p>
                                            <div className="progress-container">
                                                <div className="progress-fill" style={{ width: `${category.percentage}%` }}></div>
                                            </div>
                                            <p className={`status-text ${isLowFunds ? 'alert' : ''}`}>{statusText}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {categoryBreakdown.length === 0 && budgetPlan.length > 0 && (
                        <div className="no-budget-message">
                            <p>No expense categories created yet. Add expense categories in the Planner to see your budget breakdown.</p>
                        </div>
                    )}

                    {budgetPlan.length === 0 && (
                        <div className="no-budget-message">
                            <p>No budget plan created yet. Go to the Planner to create your budget.</p>
                        </div>
                    )}
                    
                    {message && (
                        <div className="message success">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};