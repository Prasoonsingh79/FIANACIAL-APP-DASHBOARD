import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, LineChart as LucideLineChart, Activity, DollarSign, CreditCard } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [animatedBalance, setAnimatedBalance] = useState(0);

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

    useEffect(() => {
        if (summary?.netBalance) {
            const target = summary.netBalance;
            const duration = 1500;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setAnimatedBalance(target);
                    clearInterval(timer);
                } else {
                    setAnimatedBalance(current);
                }
            }, duration / steps);
            return () => clearInterval(timer);
        }
    }, [summary]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    const calculateChartData = () => {
        if (!summary?.recentTransactions) return { areaData: [], pieData: [], barData: [] };
        
        const areaData = summary.recentTransactions.slice(0, 7).reverse().map((t: any, i: number) => ({
            name: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
            income: t.type === 'INCOME' ? t.amount : 0,
            expense: t.type === 'EXPENSE' ? t.amount : 0,
        }));

        const pieData = summary.categoryWiseTotals?.slice(0, 6).map((item: any) => ({
            name: item.category,
            value: Number(item._sum?.amount) || 0,
        })) || [];

        const barData = summary.categoryWiseTotals?.slice(0, 6).map((item: any) => ({
            category: item.category,
            amount: Number(item._sum?.amount) || 0,
            fill: COLORS[summary.categoryWiseTotals.indexOf(item) % COLORS.length],
        })) || [];

        return { areaData, pieData, barData };
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center h-screen text-slate-400">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm">Loading your financial data...</p>
            </div>
        </div>
    );

    const { areaData, pieData, barData } = calculateChartData();
    const netBalance = summary?.netBalance || 0;

    return (
        <div className="flex-1 p-8 space-y-8 overflow-y-auto h-screen">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Financial Overview</h2>
                    <p className="text-slate-400">Track your income, expenses, and financial health.</p>
                </div>
                <div className="text-right bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Net Balance</p>
                    <h3 className={`text-4xl font-mono font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${animatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                </div>
            </header>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Income', value: summary?.totals?.totalIncome || 0, icon: TrendingUp, color: '#10b981', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
                    { label: 'Total Expenses', value: summary?.totals?.totalExpense || 0, icon: TrendingDown, color: '#f43f5e', bgColor: 'bg-rose-500/10', textColor: 'text-rose-400' },
                    { label: 'Categories', value: pieData.length, icon: PieChart, color: '#6366f1', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400' },
                    { label: 'Transactions', value: summary?.recentTransactions?.length || 0, icon: Activity, color: '#f59e0b', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
                ].map((card, index) => (
                    <motion.div 
                        key={card.label} 
                        variants={itemVariants}
                        className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                                <p className={`text-2xl font-bold ${card.textColor}`}>
                                    {card.label === 'Categories' || card.label === 'Transactions' 
                                        ? card.value 
                                        : `$${card.value.toLocaleString()}`}
                                </p>
                            </div>
                            <div className={`${card.bgColor} p-3 rounded-xl`}>
                                <card.icon className={`w-6 h-6 ${card.textColor}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            Recent Transactions
                        </h3>
                        <span className="text-xs text-slate-500">Last 7 days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
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
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} name="Income" />
                            <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} name="Expense" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                            Category Breakdown
                        </h3>
                        <span className="text-xs text-slate-500">By spending</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="category" stroke="#64748b" axisLine={false} tickLine={false} width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                                {barData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-rose-400" />
                    Expense Distribution
                </h3>
                <div className="flex items-center justify-center gap-8">
                    <ResponsiveContainer width={200} height={200}>
                        <RechartsPieChart>
                            <Pie
                                data={pieData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {pieData.map((_entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2">
                        {pieData.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-sm text-slate-300">{entry.name}</span>
                                <span className="text-xs text-slate-500">${entry.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
