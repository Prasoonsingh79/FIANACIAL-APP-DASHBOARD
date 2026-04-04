# Nexus Finance - Dashboard & Access Control System

A premium full-stack finance management system built with **Node.js, TypeScript, React, and MongoDB**.

## 🚀 Key Features
- **Role-Based Access Control (RBAC)**: 
  - `Admin`: Full CRUD on transactions and user management.
  - `Analyst`: View transactions and dashboard insights.
  - `Viewer`: Dashboard summaries only.
- **Dynamic Analytics**: Real-time charts for income, expenses, and weekly trends.
- **Modern UI**: Glassmorphism design with Framer Motion animations.
- **Secure Auth**: JWT-based authentication with Bcrypt password hashing.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Database**: MongoDB.

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or a cloud URI)

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file (already provided)
npm run seed  # Populates demo users and transactions
npm run dev   # Starts server on port 5000
```

**Demo Credentials**:
- **Admin**: `admin@finance.com` / `password123`
- **Analyst**: `analyst@finance.com` / `password123`
- **Viewer**: `viewer@finance.com` / `password123`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev   # Starts dev server on port 5173
```

---

## 🏗️ Architecture Assumptions
1. **Simplified Auth**: Used JWT stored in `localStorage` for simplicity (Production should use secure cookies).
2. **Access Control**: Implemented at both API level (Middleware) and UI level (Route protection).
3. **Data Aggregation**: MongoDB's `$aggregate` pipeline is used for calculating balances and trends.
