import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UserCheck, AlertTriangle, PieChart, LogOut, Building2 } from 'lucide-react';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/verifications', label: 'KYC Verifications', icon: UserCheck },
    { path: '/admin/disputes', label: 'Dispute Resolution', icon: AlertTriangle },
    { path: '/admin/profit-share', label: 'Profit-Share Ledger', icon: PieChart },
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-blue-900/40 text-white shadow-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5 font-bold text-lg group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <span>Sahakar<span className="text-blue-400">Admin</span></span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wide">
            Cooperative Governance
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-blue-800/40 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            {user.name || 'Coop Admin'}
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
