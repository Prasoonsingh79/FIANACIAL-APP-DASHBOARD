import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'analyst', 'viewer'] },
    { to: '/transactions', name: 'Transactions', icon: ReceiptText, roles: ['admin', 'analyst'] },
    { to: '/users', name: 'Users', icon: Users, roles: ['admin'] },
  ];

  return (
    <aside className="w-64 h-screen glass-card sticky top-0 flex flex-col p-6 m-4 rounded-3xl">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="bg-indigo-500/20 p-2 rounded-xl">
          <Wallet className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Nexus Finance</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {links.filter(link => user && link.roles.includes(user.role)).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => twMerge(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
              isActive ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-medium" 
                       : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="mb-4 px-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Signed in as</p>
          <p className="text-sm font-medium text-slate-100">{user?.name}</p>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
