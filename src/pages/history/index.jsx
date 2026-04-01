import { useState } from 'react';
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import { Sidebar } from '../../components/Sidebar';

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

const getCategoryColor = (category) => {
    const colorMap = {
        'Groceries': { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
        'Food': { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
        'Dining': { bg: 'bg-surface-container-highest', text: 'text-primary' },
        'Utilities': { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed-variant' },
        'Housing': { bg: 'bg-surface-container-highest', text: 'text-primary' },
        'Rent': { bg: 'bg-surface-container-highest', text: 'text-primary' },
        'Transport': { bg: 'bg-secondary-fixed-dim/40', text: 'text-on-secondary-fixed-variant' },
        'Gas': { bg: 'bg-secondary-fixed-dim/40', text: 'text-on-secondary-fixed-variant' },
        'Entertainment': { bg: 'bg-error-container/40', text: 'text-error' },
        'Salary': { bg: 'bg-primary-container/10', text: 'text-primary' },
        'Income': { bg: 'bg-primary-container/10', text: 'text-primary' },
    };
    return colorMap[category] || { bg: 'bg-surface-container-low', text: 'text-on-surface' };
};

const groupTransactionsByDate = (transactions) => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    transactions.forEach((tx) => {
        let dateLabel;
        const txDate = new Date(tx.createdAt?.toDate ? tx.createdAt.toDate() : tx.createdAt);
        txDate.setHours(0, 0, 0, 0);

        if (txDate.getTime() === today.getTime()) {
            dateLabel = 'Today';
        } else if (txDate.getTime() === yesterday.getTime()) {
            dateLabel = 'Yesterday';
        } else {
            dateLabel = txDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        if (!groups[dateLabel]) {
            groups[dateLabel] = [];
        }
        groups[dateLabel].push(tx);
    });

    return groups;
};

export const History = () => {
    const { transactions } = useGetTransactions();
    const { profilePhoto } = useGetUserInfo();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter to show only expense transactions
    const expenseTransactions = transactions?.filter(tx => tx.transactionType === 'expense') || [];

    // Filter by search term
    const filteredTransactions = expenseTransactions.filter(tx =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedTransactions = groupTransactionsByDate(filteredTransactions);

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 min-h-screen w-full">
                {/* Header */}
                <header className="flex justify-between items-center w-full px-8 py-6 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-40 border-b border-outline-variant/10">
                    <h2 className="font-headline text-2xl font-semibold text-on-surface">Transaction History</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                            <input
                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface placeholder-on-surface-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                                placeholder="Find transactions..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-on-surface-variant cursor-pointer">
                            {profilePhoto && <img src={profilePhoto} alt="User Profile" className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-highest" />}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <section className="px-8 py-10 max-w-6xl mx-auto">
                    {/* Filters */}
                    {expenseTransactions.length > 0 && (
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-medium hover:opacity-80 transition-all">
                                    <span className="material-symbols-outlined text-base">filter_list</span>
                                    Category
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container-high transition-all">
                                    <span className="material-symbols-outlined text-base">calendar_month</span>
                                    Last 30 Days
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-medium hover:bg-surface-container-high transition-all">
                                    <span className="material-symbols-outlined text-base">swap_vert</span>
                                    Sort
                                </button>
                            </div>
                            <p className="text-sm text-outline font-medium tracking-tight">Showing {filteredTransactions.length} transactions</p>
                        </div>
                    )}

                    {/* Transaction Groups */}
                    {filteredTransactions.length > 0 ? (
                        <div className="space-y-12">
                            {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
                                <div key={dateLabel}>
                                    <h3 className="font-headline text-sm font-bold tracking-widest uppercase text-outline mb-6 flex items-center gap-3">
                                        {dateLabel}
                                        <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
                                    </h3>
                                    <div className="space-y-4">
                                        {txs.map((transaction, index) => {
                                            const colors = getCategoryColor(transaction.category);
                                            const icon = getCategoryIcon(transaction.category);
                                            return (
                                                <div key={index} className="group bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between transition-all hover:bg-surface-container-low cursor-pointer border border-transparent hover:border-outline-variant/20">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 ${colors.bg} flex items-center justify-center rounded-xl ${colors.text}`}>
                                                            <span className="material-symbols-outlined">{icon}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-on-surface">{transaction.description}</h4>
                                                            <p className="text-xs text-outline font-medium">{transaction.category} • {new Date(transaction.createdAt?.toDate ? transaction.createdAt.toDate() : transaction.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-headline text-lg font-bold text-on-surface">-${parseFloat(transaction.transactionAmount).toFixed(2)}</p>
                                                        <p className="text-xs text-secondary font-medium">Completed</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Export Section */}
                            <div className="mt-16 bg-surface-container-low rounded-2xl p-8 flex items-center justify-between overflow-hidden relative">
                                <div className="z-10 relative">
                                    <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Need a detailed report?</h3>
                                    <p className="text-on-surface-variant max-w-sm">Export your transaction history in PDF or CSV format for your records.</p>
                                    <button className="mt-6 px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all font-headline">
                                        Export Records
                                    </button>
                                </div>
                                <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
                                    <div className="h-full w-full bg-gradient-to-l from-primary to-transparent"></div>
                                </div>
                                <span className="material-symbols-outlined text-[120px] absolute -right-4 -bottom-4 text-primary/5 select-none" style={{ fontVariationSettings: "'FILL' 1" }}>file_download</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low rounded-2xl">
                            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">inbox</span>
                            <p className="text-lg text-on-surface-variant font-medium">No expense transactions yet</p>
                            <p className="text-sm text-on-surface-variant">Start adding transactions to see them here</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
