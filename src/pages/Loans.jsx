import React, { useState } from 'react';
import { useSacco } from '../context/SaccoContext';
import { Landmark, Plus, ArrowRight } from 'lucide-react';

const Loans = () => {
  const { loans, members, getMemberName, addLoan, approveLoan, rejectLoan, recordLoanRepayment } = useSacco();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'pending'
  const [isLoading, setIsLoading] = useState(false);
  
  const [newLoan, setNewLoan] = useState({ memberId: '', principal: '', interestRate: '10', repaymentMonths: '6', reason: 'Admin issued' });
  const [repayAmount, setRepayAmount] = useState('');

  const handleIssueLoan = async (e) => {
    e.preventDefault();
    if (newLoan.memberId && newLoan.principal) {
      setIsLoading(true);
      try {
        await addLoan({ 
          memberId: newLoan.memberId, 
          principal: Number(newLoan.principal), 
          interestRate: Number(newLoan.interestRate),
          repaymentMonths: Number(newLoan.repaymentMonths),
          reason: newLoan.reason,
          status: 'Active'
        });
        setNewLoan({ memberId: '', principal: '', interestRate: '10', repaymentMonths: '6', reason: 'Admin issued' });
        setShowIssueModal(false);
      } catch (err) {
        alert('Failed to issue loan: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this loan? The money will be deducted from the Sacco balance.')) {
      setIsLoading(true);
      try {
        await approveLoan(id);
      } catch (err) {
        alert('Approval failed: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this loan application?')) {
      setIsLoading(true);
      try {
        await rejectLoan(id);
      } catch (err) {
        alert('Rejection failed: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRepayLoan = async (e) => {
    e.preventDefault();
    if (selectedLoan && repayAmount) {
      setIsLoading(true);
      try {
        await recordLoanRepayment(selectedLoan.id, Number(repayAmount));
        setRepayAmount('');
        setShowRepayModal(false);
        setSelectedLoan(null);
      } catch (err) {
        alert('Failed to record repayment: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openRepayModal = (loan) => {
    setSelectedLoan(loan);
    setShowRepayModal(true);
  };

  const pendingCount = loans.filter(l => l.status === 'Pending').length;
  const filteredLoans = activeTab === 'pending' 
    ? loans.filter(l => l.status === 'Pending')
    : loans.filter(l => l.status !== 'Pending');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <div>
          <h1>Loan Management</h1>
          <p className="text-muted">Issue loans and track repayments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowIssueModal(true)} disabled={isLoading}>
          <Plus size={18} />
          Issue Loan
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('active')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'active' ? '700' : '500', cursor: 'pointer', padding: '0.5rem 1rem',
            borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Active / Paid Loans
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'pending' ? 'var(--warning)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'pending' ? '700' : '500', cursor: 'pointer', padding: '0.5rem 1rem',
            borderBottom: activeTab === 'pending' ? '2px solid var(--warning)' : 'none',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          Pending Applications {pendingCount > 0 && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>}
        </button>
      </div>

      <div className="glass-panel card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Principal</th>
                <th>Period</th>
                <th>Status</th>
                <th>Reason / Detail</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.slice().reverse().map(loan => {
                const totalDue = loan.principal + (loan.principal * loan.interestRate / 100);
                const balance = totalDue - (loan.amountPaid || 0);
                
                return (
                  <tr key={loan.id}>
                    <td>{loan.dateIssued}</td>
                    <td style={{ fontWeight: '500' }}>{getMemberName(loan.memberId)}</td>
                    <td style={{ fontWeight: '600' }}>UGX {loan.principal.toLocaleString()}</td>
                    <td className="text-muted">{loan.repaymentMonths} Mo</td>
                    <td>
                      <span style={{ 
                        background: 
                          loan.status === 'Active' ? 'rgba(239, 68, 68, 0.2)' : 
                          loan.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 
                          'rgba(16, 185, 129, 0.2)', 
                        color: 
                          loan.status === 'Active' ? 'var(--danger)' : 
                          loan.status === 'Pending' ? 'var(--warning)' : 
                          'var(--success)', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {loan.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div className="text-muted">{loan.reason}</div>
                      {loan.status === 'Active' && <div className="text-danger">Bal: UGX {balance.toLocaleString()}</div>}
                    </td>
                    <td>
                      {loan.status === 'Active' && (
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => openRepayModal(loan)}
                          disabled={isLoading}
                        >
                          Repay
                        </button>
                      )}
                      {loan.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handleApprove(loan.id)}
                            disabled={isLoading}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleReject(loan.id)}
                            disabled={isLoading}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>No {activeTab === 'pending' ? 'pending applications' : 'loans'} found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showIssueModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2>Issue New Loan</h2>
            <form onSubmit={handleIssueLoan}>
              <div className="form-group">
                <label>Member</label>
                <select 
                  className="form-control"
                  value={newLoan.memberId}
                  onChange={(e) => setNewLoan({...newLoan, memberId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Principal Amount (UGX)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newLoan.principal}
                  onChange={(e) => setNewLoan({...newLoan, principal: e.target.value})}
                  required
                  min="10000"
                />
              </div>
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newLoan.interestRate}
                  onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Repayment Period (Months)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newLoan.repaymentMonths}
                  onChange={(e) => setNewLoan({...newLoan, repaymentMonths: e.target.value})}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Reason / Note</label>
                <textarea 
                  className="form-control"
                  value={newLoan.reason}
                  onChange={(e) => setNewLoan({...newLoan, reason: e.target.value})}
                  required
                  placeholder="e.g. Approved by board"
                  style={{ minHeight: '60px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowIssueModal(false)} disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Issuing...' : 'Issue Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRepayModal && selectedLoan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2>Record Repayment</h2>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              Recording repayment for <strong>{getMemberName(selectedLoan.memberId)}</strong>
            </p>
            <form onSubmit={handleRepayLoan}>
              <div className="form-group">
                <label>Amount (UGX)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  required
                  min="100"
                  max={(selectedLoan.principal + (selectedLoan.principal * selectedLoan.interestRate / 100)) - selectedLoan.amountPaid}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowRepayModal(false)} disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={isLoading}>
                  {isLoading ? 'Recording...' : 'Record Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
