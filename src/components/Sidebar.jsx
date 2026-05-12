import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Landmark, FileText, LogOut, Settings } from 'lucide-react';
import { useSacco } from '../context/SaccoContext';
import classes from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout, changeAdminPassword } = useSacco();
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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
    <aside className={`${classes.sidebar} glass-panel`}>
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
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={classes.footer}>
        <p style={{ marginBottom: '1rem' }}>Logged in as {user?.username}</p>
        
        {user?.role === 'Admin' && (
          <button 
            className="btn" 
            style={{ width: '100%', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} 
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
            Settings
          </button>
        )}

        <button className="btn btn-danger" onClick={logout} style={{ width: '100%' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2>Change Admin Password</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newPassword.trim()) {
                changeAdminPassword(newPassword.trim());
                setNewPassword('');
                setShowSettings(false);
                alert("Admin password updated successfully!");
              }
            }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>New Password</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn" onClick={() => setShowSettings(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
