import React, { useState } from 'react';
import { useSacco } from '../context/SaccoContext';
import { Wallet, Plus } from 'lucide-react';

const Savings = () => {
  const { savings, members, getMemberName, addSaving, verifySaving } = useSacco();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [newSaving, setNewSaving] = useState({ memberId: '', amount: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSaving = async (e) => {
    e.preventDefault();
    if (newSaving.memberId && newSaving.amount) {
      setIsLoading(true);
      try {
        await addSaving({ ...newSaving, type: 'Deposit' });
        setNewSaving({ memberId: '', amount: '' });
        setShowModal(false);
      } catch (err) {
        alert('Failed to record saving: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async (id) => {
    if (window.confirm('Are you sure you have verified this transaction on your phone?')) {
      try {
        await verifySaving(id);
      } catch (err) {
        alert('Verification failed: ' + err.message);
      }
    }
  };

  const filteredSavings = activeTab === 'pending' 
    ? savings.filter(s => s.status === 'Pending')
    : savings;

  const totalSavings = savings
    .filter(s => s.status === 'Verified')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const pendingCount = savings.filter(s => s.status === 'Pending').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <div>
          <h1>Savings & Deposits</h1>
          <p className="text-muted">Total Verified Savings: <strong className="text-success">UGX {totalSavings.toLocaleString()}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={isLoading}>
          <Plus size={18} />
          Record Deposit
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'all' ? '700' : '500', cursor: 'pointer', padding: '0.5rem 1rem',
            borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : 'none'
          }}
        >
          All Savings
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
          Pending Verification {pendingCount > 0 && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>}
        </button>
      </div>

      <div className="glass-panel card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Method / ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSavings.slice().reverse().map(saving => (
                <tr key={saving.id}>
                  <td>{saving.date}</td>
                  <td style={{ fontWeight: '500' }}>{getMemberName(saving.memberId)}</td>
                  <td className="text-success" style={{ fontWeight: '600' }}>UGX {Number(saving.amount).toLocaleString()}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{saving.paymentMethod || 'Cash'}</div>
                    {saving.transactionId && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{saving.transactionId}</div>}
                  </td>
                  <td>
                    <span style={{ 
                      background: saving.status === 'Verified' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                      color: saving.status === 'Verified' ? 'var(--success)' : 'var(--warning)', 
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600'
                    }}>
                      {saving.status || 'Verified'}
                    </span>
                  </td>
                  <td>
                    {saving.status === 'Pending' && (
                      <button className="btn btn-sm btn-success" onClick={() => handleVerify(saving.id)}>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSavings.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No {activeTab === 'pending' ? 'pending' : ''} savings records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2>Record Deposit</h2>
            <form onSubmit={handleAddSaving}>
              <div className="form-group">
                <label>Member</label>
                <select 
                  className="form-control"
                  value={newSaving.memberId}
                  onChange={(e) => setNewSaving({...newSaving, memberId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount (UGX)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={newSaving.amount}
                  onChange={(e) => setNewSaving({...newSaving, amount: e.target.value})}
                  required
                  min="1000"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
