# SACCO Backend API

A Node.js/Express backend for the J&J Family SACCO application.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication

**POST /api/auth/login**
- Request: `{ username: string, password: string }`
- Response: `{ user: { id, username, role }, token: string }`

**POST /api/auth/logout**
- Response: `{ message: string }`

**POST /api/auth/change-password**
- Request: `{ currentPassword: string, newPassword: string }`
- Response: `{ message: string }`

### Members

**GET /api/members**
- Response: `Member[]`

**POST /api/members**
- Request: `{ name: string, role?: string }`
- Response: `{ id, name, role, username, password, joinedAt }`

**GET /api/members/:id**
- Response: `Member`

**PUT /api/members/:id**
- Request: `{ name?, role? }`
- Response: `Member`

**DELETE /api/members/:id**
- Response: `{ message: string }`

### Savings

**GET /api/savings**
- Response: `Saving[]`

**GET /api/savings/member/:memberId**
- Response: `Saving[]`

**POST /api/savings**
- Request: `{ memberId: string, amount: number }`
- Response: `{ id, memberId, amount, date }`

**GET /api/savings/stats/total**
- Response: `{ total: number }`

### Loans

**GET /api/loans**
- Response: `Loan[]`

**GET /api/loans/member/:memberId**
- Response: `Loan[]`

**POST /api/loans**
- Request: `{ memberId: string, principal: number, interestRate: number, repaymentMonths: number }`
- Response: `{ id, memberId, principal, interestRate, repaymentMonths, amountPaid, status, dateIssued }`

**POST /api/loans/:loanId/repayment**
- Request: `{ amount: number }`
- Response: `Loan`

**GET /api/loans/stats/total-issued**
- Response: `{ total: number }`

**GET /api/loans/stats/total-repayments**
- Response: `{ total: number }`

## Data Persistence

- Data is stored in `backend/db/data.json`
- All changes are automatically saved to the file
- Database initializes with default admin password: `Adallyn2290`

## CORS Configuration

Frontend should be running on `http://localhost:5173` (Vite default)

## Development

For auto-reload on file changes:
```bash
npm run dev
```
