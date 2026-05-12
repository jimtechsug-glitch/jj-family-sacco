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

  const [showPayModal, setShowPayModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loanRequest, setLoanRequest] = useState({ principal: '', repaymentMonths: 1, reason: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const personalSavings = getMemberPersonalSavings(user.id);
  const activeLoan = getMemberActiveLoan(user.id);
  const loanEligibility = getMemberLoanEligibility(user.id);
  const recentSavings = getMemberRecentSavings(user.id);

  const handleLoanApplication = async (e) => {
    e.preventDefault();
    if (!loanRequest.principal || Number(loanRequest.principal) <= 0) return;
    if (Number(loanRequest.principal) > loanEligibility) {
      alert(`Your maximum loan eligibility is UGX ${loanEligibility.toLocaleString()}.`);
      return;
    }

    setIsProcessing(true);
    try {
      await addLoan({
        memberId: user.id,
        principal: Number(loanRequest.principal),
        interestRate: 10, // Default interest rate
        repaymentMonths: Number(loanRequest.repaymentMonths),
        reason: loanRequest.reason,
        status: 'Pending'
      });
      alert('Loan application submitted successfully! Please wait for admin approval.');
      setShowLoanModal(false);
      setLoanRequest({ principal: '', repaymentMonths: 1, reason: '' });
    } catch (err) {
      alert('Failed to apply for loan: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  let loanBalance = 0;
  if (activeLoan) {
    const totalDue = activeLoan.principal + (activeLoan.principal * activeLoan.interestRate / 100);
    loanBalance = totalDue - activeLoan.amountPaid;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleAirtelPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    if (!transactionId) {
      alert('Please enter the Transaction ID from your Airtel Money message.');
      return;
    }

    setIsProcessing(true);
    try {
      await processAirtelPayment(Number(payAmount), transactionId);
      alert('Payment details submitted successfully! The admin will verify your transaction shortly.');
      setShowPayModal(false);
      setPayAmount('');
      setTransactionId('');
    } catch (err) {
      alert('Failed to process Airtel payment: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`animate-fade-in ${classes.dashboard}`}>
      <div className="flex-between">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p className="text-muted">Member Dashboard - Family Sacco</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn" 
            style={{ 
              background: '#ff0000', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontWeight: '600'
            }} 
            onClick={() => setShowPayModal(true)}
          >
            <img src={AirtelMoneyLogo} alt="Airtel" style={{ height: '18px' }} />
            Pay via Airtel
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowLoanModal(true)}
            disabled={activeLoan || loanEligibility === 0}
          >
            <Send size={18} />
            Apply for Loan
          </button>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>* Must be active for 6 months</span>
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

      {/* Airtel Money Payment Modal */}
      {showPayModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          backdropFilter: 'blur(4px)' 
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img src={AirtelMoneyLogo} alt="Airtel Money" style={{ height: '40px', marginBottom: '1rem' }} />
              <h2>Pay via Airtel Money</h2>
              <p className="text-muted">Send savings to: <strong style={{ color: '#ff0000' }}>0754591456</strong></p>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Prompt will be sent to your registered number:</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {user.phoneNumber || 'Not Registered'}
                </p>
              </div>
              <p className="text-muted">Enter the amount to send to Sacco</p>
            </div>
            <form onSubmit={handleAirtelPayment}>
              <div className="form-group">
                <label>Amount (UGX)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  min="500"
                  placeholder="e.g. 50000"
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Transaction ID (from Airtel message)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  placeholder="e.g. MP230101.1234.H12345"
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--warning)', margin: '1rem 0' }}>
                * Please send the money manually to the number above, then enter the ID from the confirmation message.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowPayModal(false)} disabled={isProcessing}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ background: '#ff0000', color: 'white' }}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Send Payment Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Loan Application Modal */}
      {showLoanModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          backdropFilter: 'blur(4px)' 
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Landmark size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <h2>Apply for a Loan</h2>
              <p className="text-muted">Maximum Eligibility: <strong>UGX {loanEligibility.toLocaleString()}</strong></p>
            </div>
            <form onSubmit={handleLoanApplication}>
              <div className="form-group">
                <label>Requested Amount (UGX)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={loanRequest.principal}
                  onChange={(e) => setLoanRequest({...loanRequest, principal: e.target.value})}
                  required
                  max={loanEligibility}
                  placeholder="e.g. 500000"
                />
              </div>
              <div className="form-group">
                <label>Repayment Period (Months)</label>
                <select 
                  className="form-control"
                  value={loanRequest.repaymentMonths}
                  onChange={(e) => setLoanRequest({...loanRequest, repaymentMonths: e.target.value})}
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map(m => (
                    <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reason for Loan</label>
                <textarea 
                  className="form-control"
                  value={loanRequest.reason}
                  onChange={(e) => setLoanRequest({...loanRequest, reason: e.target.value})}
                  required
                  placeholder="e.g. Business expansion, School fees..."
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <p style={{ margin: 0 }}><strong>Estimated Interest:</strong> 10% Flat Rate</p>
                <p style={{ margin: '0.25rem 0 0 0' }}><strong>Total Repayable:</strong> UGX {(Number(loanRequest.principal) * 1.1).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowLoanModal(false)} disabled={isProcessing}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
