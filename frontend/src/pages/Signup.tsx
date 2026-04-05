import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-10 glass-card rounded-[40px] shadow-2xl relative z-10 border border-white/5"
      >
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-6 bg-indigo-500/20 p-4 rounded-3xl group transition-all duration-300 hover:scale-110 border border-indigo-500/30">
                <Wallet className="w-10 h-10 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-slate-400 font-medium">Join Nexus Finance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
            <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 bg-slate-900/50 border border-slate-800 rounded-2xl py-4 text-white focus:border-indigo-500/50 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 text-sm"
                    placeholder="John Doe"
                    required
                />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 bg-slate-900/50 border border-slate-800 rounded-2xl py-4 text-white focus:border-indigo-500/50 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 text-sm"
                    placeholder="name@email.com"
                    required
                />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 bg-slate-900/50 border border-slate-800 rounded-2xl py-4 text-white focus:border-indigo-500/50 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 text-sm"
                    placeholder="••••••••"
                    required
                />
            </div>
          </div>

          {error && <p className="text-sm text-rose-400 font-medium bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                    Log In
                </a>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;