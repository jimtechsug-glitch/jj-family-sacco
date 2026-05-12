import React, { useState } from 'react';
import { useSacco } from '../context/SaccoContext';
import { Wallet, Plus } from 'lucide-react';

const Savings = () => {
  const { savings, members, getMemberName, addSaving } = useSacco();
  const [showModal, setShowModal] = useState(false);
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

  const totalSavings = savings.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <div>
          <h1>Savings & Deposits</h1>
          <p className="text-muted">Total Sacco Savings: <strong className="text-success">UGX {totalSavings.toLocaleString()}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={isLoading}>
          <Plus size={18} />
          Record Deposit
        </button>
      </div>

      <div className="glass-panel card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Member</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {savings.slice().reverse().map(saving => (
                <tr key={saving.id}>
                  <td className="text-muted">#{saving.id}</td>
                  <td>{saving.date}</td>
                  <td style={{ fontWeight: '500' }}>{getMemberName(saving.memberId)}</td>
                  <td><span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem' }}>{saving.type}</span></td>
                  <td className="text-success">+ UGX {Number(saving.amount).toLocaleString()}</td>
                </tr>
              ))}
              {savings.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No savings records found.</td>
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
