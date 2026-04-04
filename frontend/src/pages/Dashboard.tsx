import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PieChart, LineChart as LucideLineChart } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await api.get('/dashboard/summary');
                setSummary(data);
            } catch (err) {
                console.error('Error fetching dashboard summary:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen text-slate-400">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );

    const chartData = summary?.weeklyTrend?.map((item: any) => ({
        name: `W${item._id.week}`,
        income: item._id.type === 'income' ? item.total : 0,
        expense: item._id.type === 'expense' ? item.total : 0,
    })) || [];

    const pieData = summary?.categoryWiseTotals?.map((item: any) => ({
        name: item._id.category,
        value: item.total
    })) || [];

    return (
        <div className="flex-1 p-8 space-y-8 overflow-y-auto h-screen">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
                    <p className="text-slate-400">Track your financial status and performance at a glance.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Net Balance</p>
                    <h3 className={`text-3xl font-mono font-bold ${summary?.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${summary?.netBalance?.toLocaleString() || 0}
                    </h3>
                </div>
            </header>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Income', value: summary?.totals?.totalIncome, icon: TrendingUp, color: 'emerald' },
                    { label: 'Total Expenses', value: summary?.totals?.totalExpense, icon: TrendingDown, color: 'rose' },
                    { label: 'Top Category', value: pieData[0]?.name || 'N/A', icon: PieChart, color: 'indigo', isText: true }
                ].map((card) => (
                    <motion.div key={card.label} variants={itemVariants} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${card.color}-500/5 rounded-full filter blur-2xl group-hover:bg-${card.color}-500/10 transition-all`}></div>
                        <div className="flex items-center gap-4">
                            <div className={`bg-${card.color}-500/20 p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <card.icon className={`w-6 h-6 text-${card.color}-400`} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">{card.label}</p>
                                <p className={`text-2xl font-bold ${card.isText ? 'text-white' : `text-${card.color}-400`}`}>
                                    {card.isText ? card.value : `$${card.value?.toLocaleString() || 0}`}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card p-8 rounded-3xl min-h-[400px]">
                    <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
                        <LucideLineChart className="w-5 h-5 text-indigo-400" />
                        Weekly Trends
                    </h3>
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card p-8 rounded-3xl min-h-[400px]">
                    <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-400" />
                        Expenses by Category
                    </h3>
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <RechartsPieChart>
                                <Pie 
                                    data={pieData} 
                                    innerRadius={80} 
                                    outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {pieData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
