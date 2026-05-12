# J-J Family SACCO

A professional-grade **Family SACCO** (Savings and Credit Co-operative) management application designed to streamline member management, financial tracking, and administrative oversight.

---

## 🚀 Overview

J-J Family SACCO is a full-stack web application providing a robust platform for managing family savings and credit operations. It features a **secure RESTful backend API**, a **persistent JSON file database**, an admin dashboard, detailed member profiles, and automated financial reporting.

---

## ✨ Key Features

- **🔐 Secure Authentication** — JWT-based admin login with protected API routes.
- **👥 Member Management** — Add, edit, and track member details, roles, and join dates.
- **💰 Savings Tracking** — Record and view individual member savings contributions.
- **🏦 Loan Management** — Issue loans, track repayments, and monitor loan status.
- **📊 Financial Dashboard** — Real-time stats for total savings, loans issued, repayments, and available cash.
- **📄 Financial Reports** — Generate and download professional monthly reports in PDF format.
- **💾 Persistent Storage** — All data is stored server-side in a JSON file database, surviving server restarts.
- **🎨 Modern UI** — Clean, responsive, and premium interface built with modern web technologies.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/) | UI framework & build tool |
| [React Router v7](https://reactrouter.com/) | Client-side routing (HashRouter) |
| [Lucide React](https://lucide.dev/) | Icons |
| [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jspdf-autotable) | PDF report generation |
| Vanilla CSS | Styling |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | REST API server |
| JSON file (`backend/db/data.json`) | Persistent data storage |
| [UUID](https://github.com/uuidjs/uuid) | Unique ID generation |
| JWT (JSON Web Tokens) | Authentication |

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/j-j-family-sacco.git
   cd j-j-family-sacco
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

---

## 🏃 Running Locally

Start both the frontend and backend with a single command:

```bash
npm run dev
```

This launches:
- **Frontend** (Vite) → http://localhost:5173
- **Backend** (Express API) → http://localhost:5000

> **Default Admin Credentials:**
> - Username: `admin`
> - Password: `Adallyn2290`

---

## 📁 Project Structure

```
jj-family-sacco/
├── backend/                  # Express.js API server
│   ├── db/
│   │   ├── database.js       # DB read/write helpers
│   │   └── data.json         # Persistent JSON database
│   ├── middleware/           # Auth middleware
│   ├── routes/               # API route handlers
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── savings.js
│   │   └── loans.js
│   └── server.js             # Express app entry point
├── src/                      # React frontend
│   ├── context/
│   │   └── SaccoContext.jsx  # Global state via React Context + API
│   ├── services/
│   │   └── api.js            # Backend API client
│   ├── components/           # Reusable UI components
│   ├── pages/                # Route-level page components
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin login |
| `POST` | `/api/auth/logout` | Logout |
| `POST` | `/api/auth/change-password` | Change admin password |
| `GET` | `/api/members` | List all members |
| `POST` | `/api/members` | Add a new member |
| `PUT` | `/api/members/:id` | Update a member |
| `DELETE` | `/api/members/:id` | Delete a member |
| `GET` | `/api/savings` | List all savings |
| `POST` | `/api/savings` | Record a saving |
| `GET` | `/api/loans` | List all loans |
| `POST` | `/api/loans` | Issue a loan |
| `POST` | `/api/loans/:id/repayment` | Record a loan repayment |

---

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.