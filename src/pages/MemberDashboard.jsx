import React, { useState } from 'react';
import { useSacco } from '../context/SaccoContext';
import { Wallet, Landmark, Calendar, Download, Send } from 'lucide-react';
import classes from './Dashboard.module.css';
import AirtelMoneyLogo from '../assets/airtel-money-logo.png';

const MemberDashboard = () => {
  const { 
    user, 
    getMemberPersonalSavings, 
    getMemberActiveLoan, 
    getMemberLoanEligibility, 
    getMemberRecentSavings,
    processAirtelPayment
  } = useSacco();

  const [isProcessing, setIsProcessing] = useState(false);

  const personalSavings = getMemberPersonalSavings(user.id);
  const activeLoan = getMemberActiveLoan(user.id);
  const loanEligibility = getMemberLoanEligibility(user.id);
  const recentSavings = getMemberRecentSavings(user.id);



  let loanBalance = 0;
  if (activeLoan) {
    const totalDue = activeLoan.principal + (activeLoan.principal * activeLoan.interestRate / 100);
    loanBalance = totalDue - activeLoan.amountPaid;
  }

  const handlePrint = () => {
    window.print();
  };



  return (
    <div className={`animate-fade-in ${classes.dashboard}`}>
      <div className="flex-between">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p className="text-muted">Member Dashboard - Family Sacco</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Download size={18} />
            Print Statement
          </button>
        </div>
      </div>

      <div className={classes.statsGrid}>
        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-muted">Total Savings</p>
            <h3>UGX {personalSavings.toLocaleString()}</h3>
          </div>
        </div>

        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-muted">Active Loan Balance</p>
            <h3>UGX {loanBalance.toLocaleString()}</h3>
          </div>
        </div>

        <div className={`glass-panel card ${classes.statCard}`}>
          <div className={classes.statIconWrapper} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-muted">Loan Eligibility (3x Savings)</p>
            <h3>UGX {loanEligibility.toLocaleString()}</h3>
            {loanEligibility === 0 && !activeLoan && (
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>
                {recentSavings.some(s => s.status === 'Pending') 
                  ? '* Your recent savings are awaiting admin verification' 
                  : '* Must be a member for 6 months and have verified savings'}
              </span>
            )}
            {activeLoan?.status === 'Pending' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>* Your loan application is being reviewed</span>
            )}
          </div>
        </div>
      </div>

      <div className={classes.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={`glass-panel card`}>
          <h2>Monthly Savings Report</h2>
          {recentSavings.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSavings.map((saving) => (
                    <tr key={saving.id}>
                      <td>{saving.date}</td>
                      <td>
                        <span style={{ 
                          background: 'rgba(16, 185, 129, 0.2)', 
                          color: 'var(--success)', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px', 
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {saving.type}
                        </span>
                      </td>
                      <td className="text-success">+ UGX {Number(saving.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p>No savings records found.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default MemberDashboard;
