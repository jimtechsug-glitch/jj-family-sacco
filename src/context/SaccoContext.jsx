import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api.js';

const SaccoContext = createContext();

export const SaccoProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core data from backend
  const [members, setMembers] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [user, setUser] = useState(null);

  // Load initial data from backend
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        const [membersList, savingsList, loansList] = await Promise.all([
          api.membersAPI.getAll(),
          api.savingsAPI.getAll(),
          api.loansAPI.getAll(),
        ]);
        setMembers(membersList);
        setSavings(savingsList);
        setLoans(loansList);
        console.log("✅ SaccoContext: Data loaded from backend");
      } catch (err) {
        console.error("❌ SaccoContext: Failed to load data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Refresh data from backend
  const refreshData = async () => {
    try {
      const [membersList, savingsList, loansList] = await Promise.all([
        api.membersAPI.getAll(),
        api.savingsAPI.getAll(),
        api.loansAPI.getAll(),
      ]);
      setMembers(membersList);
      setSavings(savingsList);
      setLoans(loansList);
    } catch (err) {
      console.error("❌ Failed to refresh data:", err);
      setError(err.message);
    }
  };

  // API-based authentication
  const login = async (username, password) => {
    try {
      const userData = await api.authAPI.login(username, password);
      setUser(userData);
      console.log("✅ Login successful:", userData.username);
      return true;
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError(err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.authAPI.logout();
      setUser(null);
      api.clearToken();
      console.log("✅ Logout successful");
    } catch (err) {
      console.error("❌ Logout failed:", err);
      setUser(null);
      api.clearToken();
    }
  };

  // Members operations
  const addMember = async (memberData) => {
    try {
      const newMember = await api.membersAPI.create(memberData.name, memberData.role, memberData.phoneNumber);
      await refreshData();
      console.log("✅ Member added:", newMember.name);
      return newMember;
    } catch (err) {
      console.error("❌ Failed to add member:", err);
      setError(err.message);
      throw err;
    }
  };

  const editMember = async (updatedMember) => {
    try {
      const result = await api.membersAPI.update(updatedMember.id, updatedMember);
      await refreshData();
      console.log("✅ Member updated:", updatedMember.name);
      return result;
    } catch (err) {
      console.error("❌ Failed to edit member:", err);
      setError(err.message);
      throw err;
    }
  };

  const removeMember = async (id) => {
    try {
      await api.membersAPI.delete(id);
      setMembers(members.filter(m => m.id !== id));
      setSavings(savings.filter(s => s.memberId !== id));
      setLoans(loans.filter(l => l.memberId !== id));
      console.log("✅ Member deleted");
      return true;
    } catch (err) {
      console.error("❌ Failed to remove member:", err);
      setError(err.message);
      throw err;
    }
  };

  // Airtel Money operations
  const processAirtelPayment = async (amount, transactionId) => {
    try {
      if (!user) throw new Error("User must be logged in");
      const result = await api.airtelMoneyAPI.processPayment(user.id, amount, user.phoneNumber, transactionId);
      console.log("✅ Airtel Money payment processed:", result);
      await refreshData();
      return result;
    } catch (err) {
      console.error("❌ Failed to process Airtel payment:", err);
      setError(err.message);
      throw err;
    }
  };

  // Savings operations
  const addSaving = async (savingData) => {
    try {
      const newSaving = await api.savingsAPI.create(savingData.memberId, savingData.amount);
      await refreshData();
      console.log("✅ Saving recorded:", newSaving.amount);
      return newSaving;
    } catch (err) {
      console.error("❌ Failed to add saving:", err);
      setError(err.message);
      throw err;
    }
  };

  const verifySaving = async (id) => {
    try {
      const updated = await api.savingsAPI.verify(id);
      await refreshData();
      console.log("✅ Saving verified");
      return updated;
    } catch (err) {
      console.error("❌ Failed to verify saving:", err);
      setError(err.message);
      throw err;
    }
  };

  // Loans operations
  const addLoan = async (loanData) => {
    try {
      const newLoan = await api.loansAPI.create(
        loanData.memberId,
        loanData.principal,
        loanData.interestRate,
        loanData.repaymentMonths,
        loanData.reason || '',
        loanData.status || 'Active'
      );
      await refreshData();
      console.log("✅ Loan operation successful:", newLoan.principal);
      return newLoan;
    } catch (err) {
      console.error("❌ Failed to process loan:", err);
      setError(err.message);
      throw err;
    }
  };

  const approveLoan = async (id) => {
    try {
      await api.loansAPI.approve(id);
      await refreshData();
      console.log("✅ Loan approved");
    } catch (err) {
      console.error("❌ Failed to approve loan:", err);
      setError(err.message);
      throw err;
    }
  };

  const rejectLoan = async (id) => {
    try {
      await api.loansAPI.reject(id);
      await refreshData();
      console.log("✅ Loan rejected");
    } catch (err) {
      console.error("❌ Failed to reject loan:", err);
      setError(err.message);
      throw err;
    }
  };

  const recordLoanRepayment = async (loanId, amount) => {
    try {
      const updatedLoan = await api.loansAPI.recordRepayment(loanId, amount);
      await refreshData();
      console.log("✅ Loan repayment recorded:", amount);
      return updatedLoan;
    } catch (err) {
      console.error("❌ Failed to record repayment:", err);
      setError(err.message);
      throw err;
    }
  };

  const changeAdminPassword = async (newPassword) => {
    try {
      // Note: API requires both current and new password
      // For now, we'll need to pass the current password
      console.warn("⚠️  changeAdminPassword requires current password via API");
      throw new Error("Use API directly for password changes");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetAllData = async () => {
    if (!window.confirm("Are you sure you want to delete ALL members, savings, and loans? This cannot be undone.")) {
      return false;
    }
    try {
      // Delete all members (which cascades to savings/loans)
      for (const member of members) {
        await api.membersAPI.delete(member.id);
      }
      setMembers([]);
      setSavings([]);
      setLoans([]);
      console.log("✅ All data reset");
      return true;
    } catch (err) {
      console.error("❌ Failed to reset data:", err);
      setError(err.message);
      return false;
    }
  };

  // Helper selectors
  const isValidMember = (memberId) => members.some(m => m.id === memberId);
  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  const getTotalSavings = () => savings.filter(s => s.status === 'Verified').reduce((acc, s) => acc + Number(s.amount), 0);
  const getTotalLoansIssued = () => loans.reduce((acc, l) => acc + Number(l.principal), 0);
  const getTotalLoanRepayments = () => loans.reduce((acc, l) => acc + Number(l.amountPaid), 0);
  const getAvailableCash = () => getTotalSavings() + getTotalLoanRepayments() - getTotalLoansIssued();

  const getMemberPersonalSavings = (memberId) => {
    return savings
      .filter(s => s.memberId === memberId && s.status === 'Verified')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  };

  const getMemberActiveLoan = (memberId) => {
    return loans.find(l => l.memberId === memberId && l.status === 'Active');
  };

  const getMemberLoanEligibility = (memberId) => {
    const activeLoan = getMemberActiveLoan(memberId);
    if (activeLoan) return 0;
    const member = members.find(m => m.id === memberId);
    if (!member) return 0;
    const joinDate = new Date(member.joinedAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (joinDate > sixMonthsAgo) return 0;
    return getMemberPersonalSavings(memberId) * 3;
  };

  const getMemberRecentSavings = (memberId) => {
    return savings.filter(s => s.memberId === memberId).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (isLoading) {
    return <div className="loading-screen">Loading SACCO data...</div>;
  }

  return (
    <SaccoContext.Provider value={{
      user,
      login,
      logout,
      changeAdminPassword,
      resetAllData,
      members,
      savings,
      loans,
      addMember,
      editMember,
      removeMember,
      addSaving,
      verifySaving,
      addLoan,
      approveLoan,
      rejectLoan,
      recordLoanRepayment,
      processAirtelPayment,
      getMemberName,
      getTotalSavings,
      getTotalLoansIssued,
      getTotalLoanRepayments,
      getAvailableCash,
      getMemberPersonalSavings,
      getMemberActiveLoan,
      getMemberLoanEligibility,
      getMemberRecentSavings,
      refreshData,
      error,
      isLoading: false,
    }}>
      {children}
    </SaccoContext.Provider>
  );
};

export const useSacco = () => useContext(SaccoContext);
