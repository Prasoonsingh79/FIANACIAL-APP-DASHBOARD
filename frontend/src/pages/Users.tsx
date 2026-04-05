import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserCheck, UserX, Check, X, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Users: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth');
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await api.put(`/auth/${id}`, { status: newStatus });
            showNotification('User status updated!', 'success');
            fetchUsers();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const updateRole = async (id: string, newRole: string) => {
        try {
            await api.put(`/auth/${id}`, { role: newRole.toUpperCase() });
            showNotification('User role updated!', 'success');
            fetchUsers();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to update role', 'error');
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex-1 p-8 space-y-6">
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

            <header className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white">Access Control</h2>
                <p className="text-slate-400">Manage user roles and permissions across the system.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u, index) => (
                    <motion.div 
                        key={u.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-2xl space-y-5 hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                                        u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{u.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                                u.status === 'ACTIVE' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                                {u.status?.toLowerCase()}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 uppercase tracking-widest ml-1 font-semibold flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                Role Permissions
                            </p>
                            <div className="flex gap-2">
                                {['ADMIN', 'ANALYST', 'VIEWER'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => updateRole(u.id, role)}
                                        className={`flex-1 px-3 py-2 rounded-xl text-[10px] uppercase font-bold transition-all border ${
                                            u.role === role 
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                                        }`}
                                    >
                                        {role.toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                            <button
                                onClick={() => toggleStatus(u.id, u.status)}
                                className={`flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all w-full ${
                                    u.status === 'ACTIVE' 
                                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                }`}
                            >
                                {u.status === 'ACTIVE' ? (
                                    <>
                                        <UserX className="w-4 h-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4" />
                                        Activate
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <p className="text-lg">No users found</p>
                </div>
            )}
        </div>
    );
};

export default Users;
