import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Filter, Search, X, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Transactions: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const [formData, setFormData] = useState({
        amount: '',
        type: 'EXPENSE',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchTransactions = async () => {
        try {
            const params: any = {};
            if (filterCategory) params.category = filterCategory;
            if (filterType) params.type = filterType;
            const { data } = await api.get('/transactions', { params });
            setTransactions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterCategory, filterType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/transactions', {
                ...formData,
                type: formData.type.toUpperCase(),
            });
            showNotification('Transaction added successfully!', 'success');
            setShowForm(false);
            fetchTransactions();
            setFormData({ amount: '', type: 'EXPENSE', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to add transaction', 'error');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await api.put(`/transactions/${id}`, {
                ...formData,
                type: formData.type.toUpperCase(),
            });
            showNotification('Transaction updated successfully!', 'success');
            setEditingId(null);
            fetchTransactions();
            setFormData({ amount: '', type: 'EXPENSE', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to update', 'error');
        }
    };

    const startEdit = (t: any) => {
        setFormData({
            amount: t.amount.toString(),
            type: t.type,
            category: t.category,
            date: new Date(t.date).toISOString().split('T')[0],
            notes: t.notes || ''
        });
        setEditingId(t.id);
    };

    const deleteTransaction = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            showNotification('Transaction deleted!', 'success');
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Delete failed', 'error');
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl ${
                            notification.type === 'success' 
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                        }`}
                    >
                        {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-center glass-card p-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white">Transactions</h2>
                    <p className="text-sm text-slate-400">Manage your income and expenses</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => { setShowForm(!showForm); setEditingId(null); }}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Transaction
                    </button>
                )}
            </header>

            <AnimatePresence>
                {(showForm || editingId) && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="glass-card p-6 rounded-2xl overflow-hidden border border-indigo-500/20"
                    >
                        <form onSubmit={editingId ? () => handleUpdate(editingId) : handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Amount</label>
                                <input 
                                    type="number" 
                                    value={formData.amount} 
                                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                                    placeholder="e.g. 500" 
                                    required 
                                    className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white w-full focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Type</label>
                                <select 
                                    value={formData.type} 
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                    className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white w-full focus:border-indigo-500 outline-none"
                                >
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Category</label>
                                <input 
                                    type="text" 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})} 
                                    placeholder="e.g. Food" 
                                    required 
                                    className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white w-full focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Date</label>
                                <input 
                                    type="date" 
                                    value={formData.date} 
                                    onChange={e => setFormData({...formData, date: e.target.value})} 
                                    required 
                                    className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white w-full focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Notes</label>
                                <input 
                                    type="text" 
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                                    placeholder="Optional notes"
                                    className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white w-full focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl font-medium flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {editingId ? 'Update' : 'Add'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setShowForm(false); setEditingId(null); }}
                                    className="bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-xl"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-4 p-4 glass-card rounded-2xl">
                <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search by category..." 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)} 
                        className="bg-transparent border-none p-0 w-full focus:ring-0 text-slate-300 placeholder-slate-500"
                    />
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)} 
                        className="bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-slate-300"
                    >
                        <option value="">All Types</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </select>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/40 border-b border-white/5">
                        <tr className="text-slate-400 text-xs uppercase tracking-widest font-medium">
                            <th className="p-5">Date</th>
                            <th className="p-5">Category</th>
                            <th className="p-5">Type</th>
                            <th className="p-5">Amount</th>
                            <th className="p-5">Notes</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5 text-slate-300 font-mono text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-5 text-white font-medium">{t.category}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                        t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                        {t.type.toLowerCase()}
                                    </span>
                                </td>
                                <td className={`p-5 font-bold font-mono ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                                </td>
                                <td className="p-5 text-slate-400 text-sm">{t.notes || '-'}</td>
                                <td className="p-5 text-right space-x-2">
                                    {user?.role === 'ADMIN' && (
                                        <>
                                            <button 
                                                onClick={() => startEdit(t)}
                                                className="p-2 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800/50 hover:bg-indigo-500/10 rounded-xl inline-flex"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => deleteTransaction(t.id)} 
                                                className="p-2 text-rose-400 hover:text-rose-100 transition-colors bg-rose-500/10 hover:bg-rose-500/20 rounded-xl inline-flex"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <p className="text-lg mb-2">No transactions found</p>
                        <p className="text-sm">Add your first transaction to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
