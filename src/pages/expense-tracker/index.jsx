import { useState } from 'react'
import { useAddTransaction } from "../../hooks/useAddTransaction";
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase-config';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export const ExpenseTracker = () => {
    const { addTransaction } = useAddTransaction();
    const { transactions, transactionsTotals } = useGetTransactions();
    const { name, profilePhoto } = useGetUserInfo();
    const navigate = useNavigate();

    const [description, setDescription] = useState("");
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [transactionType, setTransactionType] = useState("expense");

    const { balance, income, expenses } = transactionsTotals;

    const onSubmit = async (e) => {
        e.preventDefault();
        addTransaction({ description, transactionAmount, transactionType });
        setDescription("");
        setTransactionAmount(0);
    }
    const signUserOut = async () => {
        try {
            await signOut(auth);
            localStorage.clear();
            navigate("/")
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="expense-tracker"> 
            <div className="container">
                <h1> {name}'s Expense Tracker</h1>
                <div className="balance">
                    <h3> Net Remaining</h3>
                    {balance >= 0 ? (
                        <h2>${balance.toFixed(2)}</h2>
                    ) : (
                        <h2>-${Math.abs(balance).toFixed(2)}</h2>
                    )}
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${Math.min((balance / income) * 100, 100)}%` }}></div>
                    </div>
                </div>
                    <div className="income">
                        <h4>Total Income</h4>
                        <p>${income.toFixed(2)}</p>
                    </div>
                    <div className="expenses">
                        <h4> Total Spent </h4>
                        <p>${expenses.toFixed(2)}</p>
                    </div>
                <form className="add-transaction" onSubmit={onSubmit} >
                    <input 
                        type="text" 
                        placeholder="Description" 
                        value={description}
                        required 
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Amount" 
                        value={transactionAmount}
                        required 
                        onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                    <input 
                        type="radio" 
                        id="expense" 
                        value="expense" 
                        checked={transactionType === "expense"} 
                        onChange={(e) => setTransactionType(e.target.value)} 
                    />
                    <label htmlFor="expense"> Expense</label>
                    <input 
                        type="radio" 
                        id="income" 
                        value="income" 
                        checked={transactionType === "income"} 
                        onChange={(e) => setTransactionType(e.target.value)}
                    />
                    <label htmlFor="income"> Income</label>

                    <button type="submit"> Add Transaction</button>
                </form>

            </div>
            {name && (
                <div className='profile'> 
                    {profilePhoto && <img className='profile-photo' src={profilePhoto} alt="Profile" />}
                    <button className='sign-out-button' onClick={signUserOut}>
                        Sign Out
                    </button>
                </div>
            )}

            <div className="transactions">
                <h3> Transactions</h3>
                <ul>
                    {transactions && transactions.map((transaction, index) => {
                        const { description, transactionAmount, transactionType } = transaction;
                        return (
                            <li key={index}>
                                <h4> {description} </h4>
                                <p>
                                    $ {transactionAmount} . <label style={{color: transactionType === "expense" ? "red" : "green"}}> {transactionType}</label>
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};