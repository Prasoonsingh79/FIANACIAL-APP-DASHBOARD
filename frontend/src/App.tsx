import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role.toUpperCase())) return <Navigate to="/" />;

  return (
    <div className="flex bg-[#0f172a] min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 filter blur-[120px] pointer-events-none -mr-40 -mt-40 rounded-full"></div>
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute roles={['admin', 'analyst']}><Transactions /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
