import './MonthlyPrompt.css';

export const MonthlyPrompt = ({ isOpen, currentMonth, onKeepPlan, onChangePlan }) => {
    if (!isOpen) return null;

    // Format month like "April 2026"
    const [year, month] = currentMonth.split('-');
    const monthName = new Date(year, parseInt(month) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2 className="modal-title">
                    End of {monthName}
                </h2>
                <p className="modal-description">
                    Your monthly budget cycle is ending. Would you like to keep your current plan or adjust it for next month?
                </p>

                <div className="modal-buttons">
                    <button
                        onClick={onKeepPlan}
                        className="modal-btn modal-btn-primary"
                    >
                        Keep Same Plan
                    </button>
                    <button
                        onClick={onChangePlan}
                        className="modal-btn modal-btn-secondary"
                    >
                        Change Plan
                    </button>
                </div>

                <p className="modal-footer">
                    Your {monthName} data will be archived and accessible in the monthly history.
                </p>
            </div>
        </div>
    );
};
