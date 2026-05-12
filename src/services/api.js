// API Service - All backend communication
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Store token in sessionStorage (cleared on browser close)
const TOKEN_KEY = 'sacco_token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

// Helper for making authenticated requests
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
};

// ==================== AUTH ENDPOINTS ====================

export const authAPI = {
  login: async (username, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    return data.user;
  },

  logout: async () => {
    clearToken();
    return fetchAPI('/auth/logout', { method: 'POST' });
  },

  changePassword: async (currentPassword, newPassword) => {
    return fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ==================== MEMBERS ENDPOINTS ====================

export const membersAPI = {
  getAll: async () => {
    return fetchAPI('/members');
  },

  getById: async (id) => {
    return fetchAPI(`/members/${id}`);
  },

  create: async (name, role = 'Member', phoneNumber = '') => {
    return fetchAPI('/members', {
      method: 'POST',
      body: JSON.stringify({ name, role, phoneNumber }),
    });
  },

  update: async (id, updates) => {
    return fetchAPI(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id) => {
    return fetchAPI(`/members/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SAVINGS ENDPOINTS ====================

export const savingsAPI = {
  getAll: async () => {
    return fetchAPI('/savings');
  },

  getByMember: async (memberId) => {
    return fetchAPI(`/savings/member/${memberId}`);
  },

  create: async (memberId, amount) => {
    return fetchAPI('/savings', {
      method: 'POST',
      body: JSON.stringify({ memberId, amount }),
    });
  },

  getTotal: async () => {
    return fetchAPI('/savings/stats/total');
  },
};

// ==================== LOANS ENDPOINTS ====================

export const loansAPI = {
  getAll: async () => {
    return fetchAPI('/loans');
  },

  getByMember: async (memberId) => {
    return fetchAPI(`/loans/member/${memberId}`);
  },

  create: async (memberId, principal, interestRate, repaymentMonths) => {
    return fetchAPI('/loans', {
      method: 'POST',
      body: JSON.stringify({ memberId, principal, interestRate, repaymentMonths }),
    });
  },

  recordRepayment: async (loanId, amount) => {
    return fetchAPI(`/loans/${loanId}/repayment`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  getTotalIssued: async () => {
    return fetchAPI('/loans/stats/total-issued');
  },

  getTotalRepayments: async () => {
    return fetchAPI('/loans/stats/total-repayments');
  },
};

// ==================== AIRTEL MONEY ENDPOINT ====================

export const airtelMoneyAPI = {
  processPayment: async (memberId, amount, memberPhoneNumber) => {
    return fetchAPI('/airtel-money', {
      method: 'POST',
      body: JSON.stringify({ 
        memberId, 
        amount,
        memberPhoneNumber,
        targetNumber: '0754591456'
      }),
    });
  },
};
