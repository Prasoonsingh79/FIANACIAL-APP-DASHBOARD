import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Filter, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Transactions: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showForm, setShowForm] = useState(false);
    
    // Form fields
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/transactions', {
                params: { category: filterCategory, type: filterType }
            });
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
            await api.post('/transactions', formData);
            setShowForm(false);
            fetchTransactions();
            setFormData({ amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err) {
            alert('Failed to create transaction');
        }
    };

    const deleteTransaction = async (id: string) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(transactions.filter(t => t._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
            <header className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl backdrop-blur-xl border border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white">Financial Records</h2>
                    <p className="text-sm text-slate-400">View and manage all transactions in the system.</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Transaction
                    </button>
                )}
            </header>

            {showForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="glass-card p-6 rounded-3xl overflow-hidden border border-indigo-500/10">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Amount</label>
                            <input type="number" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} placeholder="e.g. 500" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Type</label>
                            <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Category</label>
                            <input type="text" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} placeholder="e.g. Food" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider ml-1">Date</label>
                            <input type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} required />
                        </div>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl font-medium">Add Entry</button>
                    </form>
                </motion.div>
            )}

            <div className="flex gap-4 p-4 glass-card rounded-2xl">
                <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search by category..." value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="bg-transparent border-none p-0 w-full focus:ring-0" />
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="bg-transparent border-none p-0 focus:ring-0 cursor-pointer">
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/40 border-b border-white/5">
                        <tr className="text-slate-400 text-xs uppercase tracking-widest font-medium">
                            <th className="p-5">Date</th>
                            <th className="p-5">Category</th>
                            <th className="p-5">Type</th>
                            <th className="p-5">Amount</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((t) => (
                            <tr key={t._id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5 text-slate-300 font-mono">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-5 text-white font-medium">{t.category}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className={`p-5 font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-100'}`}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                </td>
                                <td className="p-5 text-right space-x-2">
                                    {user?.role === 'admin' && (
                                        <>
                                            <button className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => deleteTransaction(t._id)} className="p-2 text-rose-400 hover:text-rose-100 transition-colors bg-rose-500/10 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && <div className="p-10 text-center text-slate-500">No transactions found.</div>}
            </div>
        </div>
    );
};

export default Transactions;
