# J-J Family SACCO

A professional-grade **Family SACCO** (Savings and Credit Co-operative) management application designed to streamline member management, financial tracking, and administrative oversight.

---

## 🚀 Overview

J-J Family SACCO is a full-stack web application providing a robust platform for managing family savings and credit operations. It features a **secure RESTful backend API** hosted on Render, a **persistent MongoDB Atlas database**, an admin dashboard, a dedicated member portal, and automated financial reporting.

---

## ✨ Key Features

- **🔐 Secure Authentication** — Role-based access (Admin/Member) with secure login and session management.
- **🛡️ Password Management** — Members and Admins can securely change their passwords directly from the sidebar.
- **👥 Member Management** — Admins can add, edit, and track member details and phone numbers.
- **💰 Savings Tracking** — Members can submit savings details via Airtel Money; Admins verify transactions to update balances.
- **🏦 Loan Management** — Members can apply for loans based on eligibility (3x savings); Admins approve/reject and track repayments.
- **📊 Financial Dashboard** — Real-time stats for available cash, total savings, and outstanding loans.
- **📄 Financial Reports** — Generate and download professional monthly reports in PDF format.
- **💾 Cloud Persistence** — All data is securely stored in MongoDB Atlas, ensuring reliability across sessions and deployments.
- **🎨 Modern UI** — Clean, responsive, and premium interface with a persistent sidebar for quick actions.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/) | UI framework & build tool |
| [React Router v7](https://reactrouter.com/) | Client-side routing (HashRouter) |
| [Lucide React](https://lucide.dev/) | Modern Iconography |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF report generation |
| Vanilla CSS | Custom premium styling |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | REST API server |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Scalable cloud database |
| [Mongoose](https://mongoosejs.com/) | MongoDB object modeling |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |

---

## 📁 Project Structure

```
jj-family-sacco/
├── backend/                  # Express.js API server
│   ├── models/               # Mongoose Schemas (Member, Saving, Loan)
│   ├── routes/               # API route handlers (auth, members, savings, loans)
│   ├── server.js             # Express app entry point & MongoDB connection
│   └── .env                  # Backend environment variables (MONGODB_URI)
├── src/                      # React frontend
│   ├── context/
│   │   └── SaccoContext.jsx  # Global state & API orchestration
│   ├── services/
│   │   └── api.js            # Axios/Fetch API client
│   ├── components/           # Reusable UI components (Sidebar, etc.)
│   ├── pages/                # Page components (Dashboard, Members, Loans, etc.)
│   ├── assets/               # Images and icons
│   └── App.jsx               # Routing and app structure
├── .github/workflows/        # CI/CD (GitHub Actions for Pages)
├── render.yaml               # Render Blueprint for backend deployment
├── vite.config.js            # Vite configuration
└── package.json              # Project dependencies & scripts
```

---

## 🏃 Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Set up Environment:**
   Create a `.env` file in the `backend/` directory with your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

3. **Launch the App:**
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:5000

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Secure login for all users |
| `POST` | `/api/auth/change-password` | Update current user password |
| `GET` | `/api/members` | List all members |
| `POST` | `/api/members` | Register a new member |
| `GET` | `/api/savings` | View all savings records |
| `PATCH` | `/api/savings/:id/verify` | Admin verification of savings |
| `GET` | `/api/loans` | View all loan applications |
| `PATCH` | `/api/loans/:id/approve` | Admin approval of loan requests |

---

## 🌐 Deployment

- **Frontend**: Automatically deployed to **GitHub Pages** via GitHub Actions on every push to `main`.
- **Backend**: Deployed to **Render**. Ensure `MONGODB_URI` is set in the Render environment variables.

---

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.