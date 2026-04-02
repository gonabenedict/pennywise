import { useState } from 'react';
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import { useDeleteTransaction } from "../../hooks/useDeleteTransaction";
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
    const { deleteTransaction } = useDeleteTransaction();
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');

    // Filter to show only expense transactions
    const expenseTransactions = transactions?.filter(tx => tx.transactionType === 'expense') || [];

    // Filter by search term
    const filteredTransactions = expenseTransactions.filter(tx =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedTransactions = groupTransactionsByDate(filteredTransactions);

    const handleDeleteTransaction = async (transactionId, description) => {
        if (window.confirm(`Are you sure you want to delete the transaction "${description}"? This action cannot be undone.`)) {
            setDeletingId(transactionId);
            try {
                await deleteTransaction(transactionId);
                setDeleteMessage(`✓ Transaction deleted successfully!`);
                setTimeout(() => setDeleteMessage(''), 3000);
            } catch (error) {
                setDeleteError(`✗ Error deleting transaction: ${error.message}`);
                setTimeout(() => setDeleteError(''), 3000);
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="history-wrapper">
            <Sidebar />
            <main className="history-main">
                {/* Header */}
                <header className="history-header">
                    <h2>Transaction History</h2>
                    <div className="header-actions">
                        <div className="search-box">
                            <span className="search-icon material-symbols-outlined">search</span>
                            <input
                                placeholder="Find transactions..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="profile-section">
                            {profilePhoto && <img src={profilePhoto} alt="User Profile" className="profile-photo" />}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <section className="history-content">
                    {/* Filters */}
                    {expenseTransactions.length > 0 && (
                        <div className="filter-section">
                            <div className="filter-buttons">
                                <button className="filter-btn">
                                    <span className="material-symbols-outlined">filter_list</span>
                                    Category
                                </button>
                                <button className="filter-btn">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                    Last 30 Days
                                </button>
                                <button className="filter-btn">
                                    <span className="material-symbols-outlined">swap_vert</span>
                                    Sort
                                </button>
                            </div>
                            <p className="transaction-count">Showing {filteredTransactions.length} transactions</p>
                        </div>
                    )}

                    {/* Transaction Groups */}
                    {filteredTransactions.length > 0 ? (
                        <div className="transaction-groups">
                            {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
                                <div key={dateLabel} className="date-group">
                                    <h3 className="date-label">
                                        {dateLabel}
                                        <div className="date-divider"></div>
                                    </h3>
                                    <div className="transactions-in-group">
                                        {txs.map((transaction, index) => {
                                            const icon = getCategoryIcon(transaction.category);
                                            return (
                                                <div key={index} className="transaction-item">
                                                    <div className="transaction-left">
                                                        <div className="transaction-icon">
                                                            <span className="material-symbols-outlined">{icon}</span>
                                                        </div>
                                                        <div className="transaction-details">
                                                            <h4>{transaction.description}</h4>
                                                            <p className="transaction-meta">{transaction.category} • {new Date(transaction.createdAt?.toDate ? transaction.createdAt.toDate() : transaction.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="transaction-right">
                                                        <div className="transaction-details-right">
                                                            <p className="transaction-amount">-${parseFloat(transaction.transactionAmount).toFixed(2)}</p>
                                                            <p className="transaction-status">Completed</p>
                                                        </div>
                                                        <button 
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                                                            disabled={deletingId === transaction.id}
                                                            title="Delete transaction"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Export Section */}
                            <div className="export-section">
                                <div className="export-content">
                                    <h3>Need a detailed report?</h3>
                                    <p>Export your transaction history in PDF or CSV format for your records.</p>
                                    <button className="export-btn">
                                        Export Records
                                    </button>
                                </div>
                                <div className="export-gradient"></div>
                                <span className="export-icon material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>file_download</span>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon material-symbols-outlined">inbox</span>
                            <p className="title">No expense transactions yet</p>
                            <p className="subtitle">Start adding transactions to see them here</p>
                        </div>
                    )}
                    
                    {deleteMessage && (
                        <div className="message success">
                            {deleteMessage}
                        </div>
                    )}
                    
                    {deleteError && (
                        <div className="message error">
                            {deleteError}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
