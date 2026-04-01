import { useState } from 'react';
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import { useGetBudgetPlan } from "../../hooks/useGetBudgetPlan";
import { useClearMonthlyData } from "../../hooks/useClearMonthlyData";
import { Sidebar } from '../../components/Sidebar';
import './styles.css';

export const ExpenseTracker = () => {
    const { transactions, transactionsTotals } = useGetTransactions();
    const { name, profilePhoto } = useGetUserInfo();
    const budgetPlan = useGetBudgetPlan();
    const { clearMonthlyData } = useClearMonthlyData();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { income, expenses } = transactionsTotals;

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
                <div className="tracker-header">
                    <div className="header-title">
                        <h1>Dashboard</h1>
                        <p className="header-subtitle">Your monthly financial overview</p>
                    </div>
                    <button 
                        className="clear-data-btn"
                        onClick={clearData}
                        disabled={isLoading}
                        title="Clear all data permanently"
                    >
                        {isLoading ? 'Clearing...' : 'Clear Data'}
                    </button>
                </div>
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
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-headline font-bold text-on-surface">Spending Buckets</h2>
                            <p className="text-sm text-on-surface-variant">Manage your monthly allocations</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categoryBreakdown.map((category, index) => {
                            const colorClasses = [
                                { icon: 'bg-surface-container-high', text: 'text-primary', bar: 'bg-primary', label: 'text-primary' },
                                { icon: 'bg-secondary-container', text: 'text-on-secondary-container', bar: 'bg-secondary', label: 'text-secondary' },
                                { icon: 'bg-tertiary-container/20', text: 'text-tertiary', bar: 'bg-tertiary', label: 'text-tertiary' },
                                { icon: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary-fixed-dim', label: 'text-primary' },
                            ];
                            const colors = colorClasses[index % colorClasses.length];
                            
                            const isFullyAllocated = category.remaining <= 0 && category.percentage >= 100;
                            const isLowFunds = category.remaining < category.amount * 0.1 && category.remaining > 0;
                            const statusText = isFullyAllocated 
                                ? 'Fully Allocated' 
                                : isLowFunds 
                                    ? 'Low Funds Alert' 
                                    : `${category.percentage.toFixed(0)}% Spent`;
                            const statusColor = isFullyAllocated 
                                ? 'text-on-surface-variant' 
                                : isLowFunds 
                                    ? 'text-error' 
                                    : 'text-on-surface-variant';
                            
                            return (
                                <div key={category.id} className="bg-surface-container-lowest p-6 rounded-xl group hover:shadow-lg transition-all border border-transparent hover:border-outline-variant/20">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center ${colors.text}`}>
                                            <span className="material-symbols-outlined" data-icon={category.icon || 'category'}>
                                                {category.icon || 'category'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Remaining</p>
                                            <p className={`text-lg font-headline font-extrabold ${category.remaining < 0 ? 'text-error' : colors.label}`}>
                                                ${category.remaining.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <h4 className="font-headline font-bold text-lg mb-1">{category.name}</h4>
                                    <p className="text-sm text-on-surface-variant mb-6 font-medium">${category.spent.toFixed(2)} of ${category.amount.toFixed(2)}</p>
                                    <div className="relative h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                        <div className={`absolute top-0 left-0 h-full ${colors.bar} transition-all duration-1000`} style={{ width: `${category.percentage}%` }}></div>
                                    </div>
                                    <p className={`mt-2 text-[10px] text-right font-bold ${statusColor} uppercase tracking-widest italic`}>{statusText}</p>
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
    );
};