import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Landmark, FileText, LogOut, Settings, Send } from 'lucide-react';
import { useSacco } from '../context/SaccoContext';
import classes from './Sidebar.module.css';
import AirtelMoneyLogo from '../assets/airtel-money-logo.png';

const Sidebar = () => {
  const { 
    user, 
    logout, 
    changePassword,
    getMemberLoanEligibility,
    getMemberActiveLoan,
    processAirtelPayment,
    addLoan
  } = useSacco();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Member actions state
  const [showPayModal, setShowPayModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loanRequest, setLoanRequest] = useState({ principal: '', repaymentMonths: 1, reason: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const activeLoan = user?.role === 'Member' ? getMemberActiveLoan(user.id) : null;
  const loanEligibility = user?.role === 'Member' ? getMemberLoanEligibility(user.id) : 0;

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

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
        interestRate: 10,
        repaymentMonths: Number(loanRequest.repaymentMonths),
        reason: loanRequest.reason,
        status: 'Pending'
      });
      alert('Loan application submitted successfully! Please wait for admin approval.');
      setShowLoanModal(false);
      setLoanRequest({ principal: '', repaymentMonths: 1, reason: '' });
      closeSidebar();
    } catch (err) {
      alert('Failed to apply for loan: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
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
      closeSidebar();
    } catch (err) {
      alert('Failed to process Airtel payment: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }

    setIsProcessing(true);
    try {
      await changePassword(passwordData.current, passwordData.new);
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      alert('Password changed successfully!');
      closeSidebar();
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const navItems = user?.role === 'Admin' ? [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/members', name: 'Members', icon: <Users size={20} /> },
    { path: '/savings', name: 'Savings', icon: <Wallet size={20} /> },
    { path: '/loans', name: 'Loans', icon: <Landmark size={20} /> },
    { path: '/reports', name: 'Reports', icon: <FileText size={20} /> },
  ] : [
    { path: '/', name: 'My Dashboard', icon: <LayoutDashboard size={20} /> }
  ];

  return (
    <>
      <button className={classes.hamburger} onClick={toggleSidebar}>
        {isOpen ? <LogOut size={24} style={{ transform: 'rotate(90deg)' }} /> : <LayoutDashboard size={24} />}
      </button>

      <div 
        className={`${classes.overlay} ${isOpen ? classes.visible : ''}`} 
        onClick={closeSidebar}
      />

      <aside className={`${classes.sidebar} glass-panel ${isOpen ? classes.open : ''}`}>
        <div className={classes.logo}>
          <div className={classes.logoIcon}>J&J</div>
          <h2>Family Sacco</h2>
        </div>
        
        <nav className={classes.nav}>
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => 
                `${classes.navItem} ${isActive ? classes.active : ''}`
              }
              onClick={closeSidebar}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

      <div className={classes.footer}>
        {user?.role === 'Member' && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="btn" 
              style={{ 
                background: '#ff0000', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9rem',
                justifyContent: 'center',
                width: '100%'
              }} 
              onClick={() => setShowPayModal(true)}
            >
              <img src={AirtelMoneyLogo} alt="Airtel" style={{ height: '16px' }} />
              Pay via Airtel
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}
              onClick={() => setShowLoanModal(true)}
              disabled={activeLoan || loanEligibility === 0}
              title={activeLoan ? "You already have an active or pending loan" : (loanEligibility === 0 ? "You need verified savings to be eligible" : "")}
            >
              <Send size={16} />
              {activeLoan?.status === 'Pending' ? 'Loan Pending...' : 'Apply for Loan'}
            </button>
          </div>
        )}

        <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logged in as {user?.username}</p>
        
        <button 
          className="btn" 
          style={{ width: '100%', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }} 
          onClick={() => setShowPasswordModal(true)}
        >
          <Settings size={18} />
          Change Password
        </button>

        <button className={`btn ${classes.logoutBtn}`} onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Member Modals */}
      {showPayModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img src={AirtelMoneyLogo} alt="Airtel Money" style={{ height: '40px', marginBottom: '1rem' }} />
              <h2 style={{ color: 'var(--text-primary)' }}>Pay via Airtel Money</h2>
              <p className="text-muted">Send savings to: <strong style={{ color: '#ff0000' }}>0754591456</strong></p>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Prompt will be sent to your registered number:</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {user.phoneNumber || 'Not Registered'}
                </p>
              </div>
            </div>
            <form onSubmit={handleAirtelPayment}>
              <div className="form-group">
                <label>Amount (UGX)</label>
                <input type="number" className="form-control" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required min="500" placeholder="e.g. 50000" autoFocus />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Transaction ID (from Airtel message)</label>
                <input type="text" className="form-control" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required placeholder="e.g. MP230101.1234.H12345" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--warning)', margin: '1rem 0' }}>* Enter the ID from your Airtel Money confirmation message.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowPayModal(false)} disabled={isProcessing}>Cancel</button>
                <button type="submit" className="btn" style={{ background: '#ff0000', color: 'white' }} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Send Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Landmark size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <h2 style={{ color: 'var(--text-primary)' }}>Apply for a Loan</h2>
              <p className="text-muted">Max Eligibility: <strong>UGX {loanEligibility.toLocaleString()}</strong></p>
            </div>
            <form onSubmit={handleLoanApplication}>
              <div className="form-group">
                <label>Requested Amount (UGX)</label>
                <input type="number" className="form-control" value={loanRequest.principal} onChange={(e) => setLoanRequest({...loanRequest, principal: e.target.value})} required max={loanEligibility} placeholder="e.g. 500000" />
              </div>
              <div className="form-group">
                <label>Repayment Period</label>
                <select className="form-control" value={loanRequest.repaymentMonths} onChange={(e) => setLoanRequest({...loanRequest, repaymentMonths: e.target.value})} required>
                  {[1, 2, 3, 4, 5, 6].map(m => (<option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea className="form-control" value={loanRequest.reason} onChange={(e) => setLoanRequest({...loanRequest, reason: e.target.value})} required placeholder="e.g. Business expansion" style={{ minHeight: '60px' }} />
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <p style={{ margin: 0 }}><strong>Total Repayable:</strong> UGX {(Number(loanRequest.principal) * 1.1).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowLoanModal(false)} disabled={isProcessing}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Submitting...' : 'Apply Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Change Password</h2>
            
            <form onSubmit={handlePasswordChange}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginTop: '1rem' }}>
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginTop: '1rem' }}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {passwordError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                  {passwordError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" className="btn" onClick={() => { setShowPasswordModal(false); setPasswordError(''); }} disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  </>
);
};

export default Sidebar;
