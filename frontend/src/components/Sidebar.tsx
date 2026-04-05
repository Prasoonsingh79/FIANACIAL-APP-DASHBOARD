import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ReceiptText, Users, LogOut, Wallet, 
  Settings, HelpCircle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', name: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { to: '/transactions', name: 'Transactions', icon: ReceiptText, roles: ['ADMIN', 'ANALYST'] },
    { to: '/users', name: 'Users', icon: Users, roles: ['ADMIN'] },
  ];

  const bottomLinks = [
    { to: '#', name: 'Settings', icon: Settings },
    { to: '#', name: 'Help', icon: HelpCircle },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 flex flex-col p-4 m-3 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border border-white/5 shadow-2xl">
      <div className="flex items-center gap-3 mb-8 px-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
          <Wallet className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Nexus Finance</h1>
          <p className="text-[10px] text-slate-400">Financial Dashboard</p>
        </div>
      </div>

      <div className="mb-6 px-3">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Current Status</span>
          </div>
          <p className="text-sm font-medium text-white">All Systems Active</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {links.filter(link => user && link.roles.includes(user.role)).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.name}</span>
            {location.pathname === link.to && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest px-3 mb-3">Support</p>
        {bottomLinks.map((link) => (
          <a
            key={link.name}
            href={link.to}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <link.icon className="w-4 h-4" />
            <span className="text-sm">{link.name}</span>
          </a>
        ))}

        <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full capitalize">
                {user?.role?.toLowerCase() || 'viewer'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;