import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SaccoProvider, useSacco } from './context/SaccoContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Savings from './pages/Savings';
import Loans from './pages/Loans';
import Reports from './pages/Reports';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';

const AppContent = () => {
  const { user } = useSacco();

  return (
    <Router>
      {!user ? (
        <Login />
      ) : (
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              {user.role === 'Admin' ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/savings" element={<Savings />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<MemberDashboard />} />
                  <Route path="*" element={<MemberDashboard />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
};

function App() {
  return (
    <SaccoProvider>
      <AppContent />
    </SaccoProvider>
  );
}

export default App;
