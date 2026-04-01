import { useGetTransactions } from "../../hooks/useGetTransactions";
import { Sidebar } from '../../components/Sidebar';
import './styles.css';

export const History = () => {
    const { transactions } = useGetTransactions();

    // Filter to show only expense transactions
    const expenseTransactions = transactions?.filter(tx => tx.transactionType === 'expense') || [];

    return (
        <div className="history-wrapper">
            <Sidebar />
            <div className="history-container">
                <div className="history-header">
                    <h1>Transaction History</h1>
                    <p className="history-subtitle">View all your expense transactions</p>
                </div>

                <div className="history-content">
                    {expenseTransactions.length > 0 ? (
                        <div className="transactions-list">
                            {expenseTransactions.map((transaction, index) => {
                                const { description, transactionAmount, transactionType, category } = transaction;
                                return (
                                    <div key={index} className="transaction-item">
                                        <div className="transaction-info">
                                            <h4 className="transaction-description">{description}</h4>
                                            <div className="transaction-badges">
                                                <span className={`type-badge ${transactionType}`}>
                                                    {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                                                </span>
                                                {category && (
                                                    <span className="category-badge">
                                                        {category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`transaction-amount ${transactionType}`}>
                                            {transactionType === "expense" ? "-" : "+"}${Math.abs(transactionAmount).toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No expense transactions yet</p>
                            <span className="empty-icon">📊</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
