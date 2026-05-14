# SACCO Backend API

A Node.js/Express backend for the J&J Family SACCO application, using MongoDB Atlas for persistence.

## 🚀 Setup & Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in this directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Authentication
- **POST `/api/auth/login`**: Authenticate user and return token.
- **POST `/api/auth/logout`**: Terminate session.
- **POST `/api/auth/change-password`**: Update password for the authenticated user.

### Members
- **GET `/api/members`**: Retrieve all members.
- **POST `/api/members`**: Register a new member (auto-generates credentials).
- **PUT `/api/members/:id`**: Update member details.
- **DELETE `/api/members/:id`**: Remove a member and their data.
- **POST `/api/members/airtel-money`**: Submit an Airtel Money transaction for verification.

### Savings
- **GET `/api/savings`**: List all savings records.
- **PATCH `/api/savings/:id/verify`**: Verify a pending saving (Admin only).

### Loans
- **GET `/api/loans`**: List all loans.
- **POST `/api/loans`**: Submit a new loan application.
- **PATCH `/api/loans/:id/approve`**: Approve a pending loan (Admin only).
- **POST `/api/loans/:id/repayment`**: Record a repayment for an active loan.

## 🗄️ Database
Data is stored in **MongoDB Atlas**. The connection is managed via Mongoose in `server.js`.

## 🌐 CORS
Configured to allow requests from the local dev server and the production GitHub Pages domain.
