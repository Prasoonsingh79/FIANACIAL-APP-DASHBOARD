import React, { useEffect, useState } from 'react';
import { Shield, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import api from '../services/api';

const Users: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.put(`/auth/${id}`, { status: newStatus });
            fetchUsers();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const updateRole = async (id: string, newRole: string) => {
        try {
            await api.put(`/auth/${id}`, { role: newRole });
            fetchUsers();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex-1 p-8 space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white">Access Control</h2>
                <p className="text-slate-400">Manage user roles and permissions across the system.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                    <div key={u._id} className="glass-card p-6 rounded-3xl space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-lg">
                                    {u.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-100">{u.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono tracking-tighter">{u.email}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {u.status}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 uppercase tracking-widest ml-1 font-semibold flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                Permissions
                            </p>
                            <div className="flex gap-2">
                                {['admin', 'analyst', 'viewer'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => updateRole(u._id, role)}
                                        className={`flex-1 px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-all border ${u.role === role ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => toggleStatus(u._id, u.status)}
                                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-colors w-full justify-center ${u.status === 'active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                            >
                                {u.status === 'active' ? <><UserX className="w-4 h-4" /> Deactivate Account</> : <><UserCheck className="w-4 h-4" /> Activate Account</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Users;
