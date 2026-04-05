import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.role) {
        localStorage.removeItem('user');
      } else {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      const userData = {
        ...data,
        id: data.id || data._id
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
