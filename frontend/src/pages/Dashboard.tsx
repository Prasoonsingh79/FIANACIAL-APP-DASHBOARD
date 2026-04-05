import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, PieChart as PieChartIcon, Activity, DollarSign, 
  CreditCard, ArrowUpRight, ArrowDownRight, Clock, Target,
  Wallet, Calendar, RefreshCw, Bell, TrendingDown as TrendChart,
  Plus, AlertTriangle, Zap, Eye, BarChart3, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Transport', 'Healthcare', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

interface SummaryData {
  netBalance: number;
  totals: { totalIncome: number; totalExpense: number };
  recentTransactions: any[];
  categoryWiseTotals: any[];
}

interface QuickStats {
  dailyIncome: number;
  dailyExpense: number;
  weeklyChange: number;
  monthlyChange: number;
  projectedIncome: number;
  projectedExpense: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'budget' | 'insights'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ amount: '', type: 'EXPENSE', category: 'Food', notes: '' });
  const [notifications, setNotifications] = useState<{id: number, msg: string, type: string}[]>([]);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setRefreshing(true);
      const { data } = await api.get('/dashboard/summary');
      const prevData = summary;
      setSummary(data);
      setLastUpdated(new Date());
      
      if (prevData && prevData.recentTransactions) {
        const newTxCount = data.recentTransactions.length - prevData.recentTransactions.length;
        if (newTxCount > 0) {
          setNotifications(prev => [
            { id: Date.now(), msg: `${newTxCount} new transaction(s) added`, type: 'success' },
            ...prev.slice(0, 2)
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const quickStats: QuickStats = useMemo(() => {
    if (!summary?.recentTransactions) {
      return { dailyIncome: 0, dailyExpense: 0, weeklyChange: 0, monthlyChange: 0, projectedIncome: 0, projectedExpense: 0 };
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayTx = summary.recentTransactions.filter(t => t.date.includes(todayStr));
    const weeklyTx = summary.recentTransactions.filter(t => new Date(t.date) >= weekAgo);
    const monthlyTx = summary.recentTransactions.filter(t => new Date(t.date) >= monthAgo);
    
    const dailyIncome = todayTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const dailyExpense = todayTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    const weeklyIncome = weeklyTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const weeklyExpense = weeklyTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const weeklyChange = weeklyIncome - weeklyExpense;
    
    const monthlyIncome = monthlyTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const monthlyChange = monthlyIncome - monthlyExpense;
    
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();
    const projectedIncome = (monthlyIncome / daysPassed) * daysInMonth;
    const projectedExpense = (monthlyExpense / daysPassed) * daysInMonth;
    
    return { dailyIncome, dailyExpense, weeklyChange, monthlyChange, projectedIncome, projectedExpense };
  }, [summary]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAdd = async () => {
    if (!newTx.amount) return;
    try {
      await api.post('/transactions', {
        amount: parseFloat(newTx.amount),
        type: newTx.type,
        category: newTx.category,
        date: new Date().toISOString().split('T')[0],
        notes: newTx.notes
      });
      setNotifications(prev => [{ id: Date.now(), msg: 'Transaction added successfully!', type: 'success' }, ...prev.slice(0, 2)]);
      setShowAddModal(false);
      setNewTx({ amount: '', type: 'EXPENSE', category: 'Food', notes: '' });
      fetchData();
    } catch (err) {
      setNotifications(prev => [{ id: Date.now(), msg: 'Failed to add transaction', type: 'error' }, ...prev.slice(0, 2)]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-lg font-medium text-slate-300">Loading your financial data...</p>
        <p className="text-sm text-slate-500 mt-2">Please wait while we fetch your dashboard</p>
      </div>
    </div>
  );

  const netBalance = summary?.netBalance || 0;
  const totalIncome = summary?.totals?.totalIncome || 0;
  const totalExpense = summary?.totals?.totalExpense || 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : '0';

  const areaData = summary?.recentTransactions?.slice(0, 10).reverse().map((t: any) => ({
    name: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    income: t.type === 'INCOME' ? t.amount : 0,
    expense: t.type === 'EXPENSE' ? t.amount : 0,
  })) || [];

  const pieData = summary?.categoryWiseTotals?.slice(0, 8).map((item: any) => ({
    name: item.category,
    value: Number(item._sum?.amount) || 0,
  })) || [];

  const barData = summary?.categoryWiseTotals?.slice(0, 6).map((item: any, idx: number) => ({
    category: item.category,
    amount: Number(item._sum?.amount) || 0,
    fill: COLORS[idx % COLORS.length],
  })) || [];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto h-screen bg-slate-950">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-2 ${
              n.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
            }`}
          >
            {n.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {n.msg}
          </motion.div>
        ))}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
          </div>
          <p className="text-slate-400">Welcome back, {user?.name || 'User'}! Here's your financial overview.</p>
          {lastUpdated && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {formatTime(lastUpdated)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user?.role !== 'VIEWER' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          )}
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Quick Transaction
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewTx({...newTx, type: 'INCOME', category: 'Salary'})}
                    className={`py-2 rounded-lg font-medium transition-all ${newTx.type === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setNewTx({...newTx, type: 'EXPENSE', category: 'Food'})}
                    className={`py-2 rounded-lg font-medium transition-all ${newTx.type === 'EXPENSE' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Expense
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newTx.amount}
                  onChange={e => setNewTx({...newTx, amount: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
                <select
                  value={newTx.category}
                  onChange={e => setNewTx({...newTx, category: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                >
                  {(newTx.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={newTx.notes}
                  onChange={e => setNewTx({...newTx, notes: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium"
                >
                  Add Transaction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: '#10b981', sub: `Today: $${quickStats.dailyIncome}`, trend: quickStats.weeklyChange >= 0 },
          { label: 'Total Expenses', value: totalExpense, icon: TrendingDown, color: '#f43f5e', sub: `Today: $${quickStats.dailyExpense}`, trend: quickStats.weeklyChange >= 0 },
          { label: 'Net Balance', value: netBalance, icon: Wallet, color: netBalance >= 0 ? '#10b981' : '#f43f5e', sub: `Monthly: $${quickStats.monthlyChange.toFixed(0)}`, trend: quickStats.monthlyChange >= 0 },
          { label: 'Savings Rate', value: savingsRate + '%', icon: Target, color: parseFloat(savingsRate) >= 20 ? '#10b981' : '#f59e0b', sub: 'Health Score', trend: parseFloat(savingsRate) >= 20 },
        ].map((card, index) => (
          <motion.div 
            key={card.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>
                  {typeof card.value === 'number' ? `$${card.value.toLocaleString()}` : card.value}
                </p>
                <div className="flex items-center gap-1">
                  {card.trend ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                  <span className="text-xs text-slate-500">{card.sub}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'budget', label: 'Budget', icon: Target },
          { id: 'insights', label: 'Insights', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendChart className="w-5 h-5 text-emerald-400" />
                    Income vs Expenses
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">Last 10 days</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} name="Income" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} name="Expense" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-400" />
                    Expense Breakdown
                  </h3>
                </div>
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="60" stroke="#1e293b" strokeWidth="12" fill="none" />
                    <circle cx="80" cy="80" r="60" stroke="#6366f1" strokeWidth="12" fill="none" strokeDasharray={`${parseFloat(savingsRate) * 3.77} 377`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-3xl font-bold text-white">{savingsRate}%</p>
                    <p className="text-xs text-slate-400">Savings Rate</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4 max-h-32 overflow-y-auto">
                  {pieData.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-slate-300">{entry.name}</span>
                      </div>
                      <span className="text-slate-400">${entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  Category Analysis
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="category" stroke="#64748b" axisLine={false} tickLine={false} width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {barData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Spending Trend
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={areaData}>
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 4 }} name="Expense" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'budget' && (
          <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Monthly Budget Goals
                </h3>
                <div className="space-y-4">
                  {[
                    { category: 'Housing', spent: 1200, limit: 1500, color: '#6366f1' },
                    { category: 'Food & Dining', spent: 450, limit: 600, color: '#10b981' },
                    { category: 'Transportation', spent: 200, limit: 300, color: '#f59e0b' },
                    { category: 'Entertainment', spent: 180, limit: 200, color: '#ef4444' },
                    { category: 'Shopping', spent: 350, limit: 400, color: '#8b5cf6' },
                  ].map((budget, index) => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    const isOver = percentage > 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{budget.category}</span>
                          <span className={isOver ? 'text-rose-400' : 'text-slate-400'}>${budget.spent} / ${budget.limit}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percentage, 100)}%` }} transition={{ delay: index * 0.1, duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: isOver ? '#f43f5e' : budget.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-rose-400" />
                  Budget Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Budget', value: '$4,000', icon: Target, color: '#6366f1' },
                    { label: 'Total Spent', value: '$2,380', icon: CreditCard, color: '#f43f5e' },
                    { label: 'Remaining', value: '$1,620', icon: Wallet, color: '#10b981' },
                    { label: 'Projected', value: `$${quickStats.projectedExpense.toFixed(0)}`, icon: TrendingDown, color: '#f59e0b' },
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        <span className="text-xs text-slate-500">{item.label}</span>
                      </div>
                      <p className="text-xl font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Financial Insights
                </h3>
                <div className="space-y-4">
                  {[
                    { title: 'Daily Spending', value: `$${quickStats.dailyExpense}`, desc: 'Today\'s expenses', icon: DollarSign },
                    { title: 'Weekly Change', value: `$${quickStats.weeklyChange.toFixed(0)}`, desc: quickStats.weeklyChange >= 0 ? 'Positive trend' : 'Needs attention', icon: quickStats.weeklyChange >= 0 ? TrendingUp : TrendingDown },
                    { title: 'Monthly Projection', value: `$${quickStats.projectedExpense.toFixed(0)}`, desc: 'Expected monthly spend', icon: Calendar },
                  ].map((insight, i) => (
                    <div key={i} className="p-4 bg-slate-800/30 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">{insight.title}</p>
                      <p className="text-xl font-bold text-white">{insight.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{insight.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Spending Pattern
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#colorBalance)" strokeWidth={2} name="Income" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Transactions
          </h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {summary?.recentTransactions?.slice(0, 5).map((tx: any, index: number) => (
                <motion.tr key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-4 text-white">{tx.notes || 'Transaction'}</td>
                  <td className="py-4"><span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md text-xs">{tx.category}</span></td>
                  <td className={`py-4 font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>{tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}</td>
                  <td className="py-4"><span className={`px-2 py-1 rounded-full text-xs ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{tx.type}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;