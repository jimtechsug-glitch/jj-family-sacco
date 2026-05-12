import React from 'react';
import { useSacco } from '../context/SaccoContext';
import { Wallet, Landmark, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import classes from './Dashboard.module.css';

const Dashboard = () => {
  const { 
    members, 
    savings, 
    loans,
    getTotalSavings, 
    getTotalLoansIssued, 
    getTotalLoanRepayments, 
    getAvailableCash,
    getMemberName
  } = useSacco();

  const totalSavings = getTotalSavings();
  const totalLoans = getTotalLoansIssued() - getTotalLoanRepayments();
  const availableCash = getAvailableCash();

  const recentTransactions = [
    ...savings.filter(s => s.status === 'Verified' && members.some(m => m.id === s.memberId)).map(s => ({ ...s, txType: 'Deposit', amount: Number(s.amount) })),
    ...loans.filter(l => members.some(m => m.id === l.memberId)).map(l => ({ ...l, txType: 'Loan Issued', amount: Number(l.principal), date: l.dateIssued })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className={`animate-fade-in ${classes.dashboard}`}>
      <div className="flex-between">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted">Welcome back to the Family Sacco</p>
        </div>
      </div>

      <div className={classes.statsGrid}>
        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-muted">Available Cash</p>
            <h3>UGX {availableCash.toLocaleString()}</h3>
          </div>
        </div>

        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-muted">Total Savings</p>
            <h3>UGX {totalSavings.toLocaleString()}</h3>
          </div>
        </div>

        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p className="text-muted">Outstanding Loans</p>
            <h3>UGX {totalLoans.toLocaleString()}</h3>
          </div>
        </div>

        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted">Total Members</p>
            <h3>{members.length}</h3>
          </div>
        </div>
      </div>

      <div className={classes.contentGrid}>
        <div className={`glass-panel card ${classes.recentTx}`}>
          <h2>Recent Transactions</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.date}</td>
                    <td>{getMemberName(tx.memberId)}</td>
                    <td>
                      <span className={`${classes.badge} ${tx.txType === 'Deposit' ? classes.badgeSuccess : classes.badgeWarning}`}>
                        {tx.txType}
                      </span>
                    </td>
                    <td className={tx.txType === 'Deposit' ? 'text-success' : 'text-danger'}>
                      {tx.txType === 'Deposit' ? '+' : '-'} UGX {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
