import { useState } from 'react';
import { useAddTransaction } from "../../hooks/useAddTransaction";
import { useGetBudgetPlan } from "../../hooks/useGetBudgetPlan";
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';

const categoryIcons = {
    'grocery': 'shopping_cart',
    'groceries': 'shopping_cart',
    'dining': 'restaurant',
    'transport': 'directions_car',
    'rent': 'home',
    'health': 'health_and_safety',
    'gym': 'fitness_center',
    'utilities': 'bolt',
    'entertainment': 'movie',
    'shopping': 'shopping_bag',
    'other': 'category'
};

export const QuickAdd = () => {
    const { addTransaction } = useAddTransaction();
    const { categories: allBudgetCategories, isLoading } = useGetBudgetPlan();
    const navigate = useNavigate();
    
    // Filter to only show EXPENSE categories in Quick Add
    const budgetCategories = allBudgetCategories.filter(cat => cat.type === 'expense');
    
    const [amount, setAmount] = useState('0.00');
    const [selectedCategory, setSelectedCategory] = useState(budgetCategories.length > 0 ? budgetCategories[0].name : "");
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');

    const getCategoryIcon = (categoryName) => {
        const key = categoryName.toLowerCase();
        return categoryIcons[key] || 'category';
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value === '' ? '0.00' : value);
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (numAmount <= 0) {
            setMessage('Please enter an amount greater than 0');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        if (!selectedCategory) {
            setMessage('Please select a category');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Get the selected category object to determine type
        const categoryObj = allBudgetCategories.find(cat => cat.name === selectedCategory);
        const transactionType = categoryObj?.type || 'expense';

        try {
            await addTransaction({
                description: note || selectedCategory,
                transactionAmount: numAmount,
                transactionType: transactionType,
                category: selectedCategory
            });
            setMessage('✓ Transaction added successfully!');
            setAmount('0.00');
            setSelectedCategory(budgetCategories.length > 0 ? budgetCategories[0].name : "");
            setNote('');
            setTimeout(() => {
                setMessage('');
            }, 2000);
        } catch (error) {
            setMessage('✗ Error adding transaction: ' + error.message);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const goToPlanner = () => {
        navigate('/planner');
    };

    return (
        <div className="flex min-h-screen bg-surface">
            <Sidebar />
            
            <main className="md:ml-64 min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-surface w-full mt-16 md:mt-0">
                {/* Header */}
                <header className="w-full max-w-2xl mb-12 flex justify-between items-center px-4">
                    <div>
                        <h2 className="font-headline text-2xl font-semibold text-primary">Quick Add</h2>
                        <p className="text-sm text-on-surface-variant font-body mt-1">Record a new transaction instantly</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                </header>

                {budgetCategories.length === 0 ? (
                    <div className="w-full max-w-2xl bg-surface-container-low p-8 rounded-2xl text-center">
                        <p className="text-on-surface-variant font-body mb-6">No budget categories created yet</p>
                        <button 
                            onClick={goToPlanner} 
                            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-semibold hover:opacity-90 transition-opacity"
                        >
                            Create Budget Plan
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl space-y-10">
                        {/* Amount Input */}
                        <section className="text-center">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Transaction Amount</label>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-5xl font-headline font-light text-outline-variant">$</span>
                                <input
                                    autoFocus
                                    type="number"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className="bg-transparent border-none text-center text-5xl font-headline font-extrabold tracking-tighter text-on-surface focus:ring-0 placeholder:text-surface-container-highest outline-none"
                                />
                            </div>
                        </section>

                        {/* Category Grid */}
                        <section className="bg-surface-container-low p-8 rounded-2xl">
                            <h3 className="font-headline text-sm font-bold text-on-surface-variant mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-base">category</span>
                                Select Category
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {budgetCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.name)}
                                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all border ${
                                            selectedCategory === category.name
                                                ? 'bg-primary-fixed-dim border-primary'
                                                : 'bg-surface-container-lowest border-transparent hover:bg-primary-fixed-dim'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                                            selectedCategory === category.name
                                                ? 'bg-primary text-on-primary'
                                                : 'bg-secondary-container text-on-secondary-container'
                                        }`}>
                                            <span className="material-symbols-outlined">{getCategoryIcon(category.name)}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-on-surface-variant">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Note Input */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Transaction Note</label>
                                <span className="text-xs text-outline uppercase tracking-widest">Optional</span>
                            </div>
                            <input
                                type="text"
                                placeholder="What was this for?"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-surface-container-high border-none rounded-lg p-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none"
                            />
                        </section>

                        {/* Confirm Button */}
                        <section className="pt-6">
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-xl font-headline font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Adding...' : 'Confirm Transaction'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <p className="text-center text-xs text-outline mt-6 font-medium uppercase tracking-wider">
                                Synced to Pennywise
                            </p>
                        </section>
                    </div>
                )}

                {/* Messages */}
                {message && (
                    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg font-semibold text-sm ${
                        message.includes('✓') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Decorative Elements */}
                <div className="fixed top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
                <div className="fixed bottom-0 left-1/4 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
            </main>
        </div>
    );
};
