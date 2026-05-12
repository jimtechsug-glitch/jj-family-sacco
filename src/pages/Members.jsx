import React, { useState } from 'react';
import { useSacco } from '../context/SaccoContext';
import { UserPlus, Search, Trash2, Edit2 } from 'lucide-react';
import classes from './Members.module.css';

const Members = () => {
  const { members, addMember, editMember, removeMember, savings, loans, resetAllData } = useSacco();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'Member', phoneNumber: '' });
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCredentials, setNewCredentials] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditMember = async (e) => {
    e.preventDefault();
    if (editingMember.name) {
      setIsLoading(true);
      try {
        await editMember(editingMember);
        setShowEditModal(false);
        setEditingMember(null);
      } catch (err) {
        alert('Failed to update member: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (newMember.name) {
      setIsLoading(true);
      try {
        const addedMember = await addMember(newMember);
        setNewCredentials({ username: addedMember.username, password: addedMember.password, name: addedMember.name });
        setNewMember({ name: '', role: 'Member', phoneNumber: '' });
        setShowModal(false);
      } catch (err) {
        alert('Failed to add member: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      setIsLoading(true);
      try {
        await removeMember(confirmDelete.id);
        setConfirmDelete(null);
      } catch (err) {
        alert('Failed to remove member: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getMemberSavings = (id) =>
    savings.filter(s => s.memberId === id).reduce((acc, curr) => acc + Number(curr.amount), 0);

  const getMemberLoans = (id) => {
    const activeLoans = loans.filter(l => l.memberId === id && l.status === 'Active');
    return activeLoans.reduce((acc, curr) => {
      const balance = curr.principal + (curr.principal * curr.interestRate / 100) - curr.amountPaid;
      return acc + balance;
    }, 0);
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`animate-fade-in ${classes.membersPage}`}>
      <div className="flex-between">
        <div>
          <h1>Family Members</h1>
          <p className="text-muted">Manage sacco members and view their balances</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-danger"
            disabled={isLoading}
            onClick={() => {
              if (window.confirm('Delete all members, savings, and loans? This cannot be undone.')) {
                resetAllData();
              }
            }}
          >
            Delete All
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
            disabled={isLoading}
          >
            <UserPlus size={18} />
            Add Member
          </button>
        </div>
      </div>

      <div className="glass-panel card">
        <div className={classes.searchBar}>
          <Search size={20} className="text-muted" />
          <input
            type="text"
            className="form-control"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Total Savings</th>
                <th>Active Loan Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id}>
                  <td style={{ fontWeight: '500' }}>{member.name}</td>
                  <td><span className={classes.roleBadge}>{member.role}</span></td>
                  <td>{member.joinedAt}</td>
                  <td className="text-success">UGX {getMemberSavings(member.id).toLocaleString()}</td>
                  <td className="text-danger">UGX {getMemberLoans(member.id).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn"
                        style={{ padding: '0.4rem', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}
                        onClick={() => { setEditingMember({ ...member }); setShowEditModal(true); }}
                        title="Edit Member"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '0.4rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}
                        onClick={() => setConfirmDelete(member)}
                        title="Remove Member"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Member Modal ── */}
      {showModal && (
        <div className={classes.modalOverlay}>
          <div className={`glass-panel ${classes.modal}`}>
            <h2>Add New Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" className="form-control"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option value="Member">Member</option>
                  <option value="Chairman">Chairman</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Secretary">Secretary</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number (Registered Airtel Number)</label>
                <input
                  type="text" className="form-control"
                  value={newMember.phoneNumber}
                  onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                  placeholder="e.g. 075XXXXXXX"
                  required
                />
              </div>
              <div className={classes.modalActions}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Member Modal ── */}
      {showEditModal && editingMember && (
        <div className={classes.modalOverlay}>
          <div className={`glass-panel ${classes.modal}`}>
            <h2>Edit Member Details</h2>
            <form onSubmit={handleEditMember}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" className="form-control"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                >
                  <option value="Member">Member</option>
                  <option value="Chairman">Chairman</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Secretary">Secretary</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number (Registered Airtel Number)</label>
                <input
                  type="text" className="form-control"
                  value={editingMember.phoneNumber}
                  onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })}
                  placeholder="e.g. 075XXXXXXX"
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text" className="form-control"
                  value={editingMember.username}
                  onChange={(e) => setEditingMember({ ...editingMember, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="text" className="form-control"
                  value={editingMember.password}
                  onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                  required
                  placeholder="Enter new password or keep existing"
                />
              </div>
              <div className={classes.modalActions}>
                <button type="button" className="btn" onClick={() => { setShowEditModal(false); setEditingMember(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className={classes.modalOverlay}>
          <div className={`glass-panel ${classes.modal}`} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Remove Member?</h2>
            <p style={{ marginBottom: '0.5rem' }}>
              You are about to permanently remove <strong>{confirmDelete.name}</strong>.
            </p>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              All their savings and loan records will also be deleted. This cannot be undone.
            </p>
            <div className={classes.modalActions}>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn"
                style={{ background: 'var(--danger)', color: '#fff' }}
                onClick={handleConfirmDelete}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Member Credentials Modal ── */}
      {newCredentials && (
        <div className={classes.modalOverlay}>
          <div className={`glass-panel ${classes.modal}`} style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Member Added!</h2>
            <p>Please share these credentials with <strong>{newCredentials.name}</strong> securely:</p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                Username: <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{newCredentials.username}</strong>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                Password: <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{newCredentials.password}</strong>
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setNewCredentials(null)} style={{ width: '100%' }}>
              I have copied them
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
