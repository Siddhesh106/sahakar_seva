import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UserCheck, AlertTriangle, PieChart, LogOut, ShieldCheck, Building2 } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/verifications', label: 'KYC Verifications', icon: UserCheck },
    { path: '/disputes', label: 'Dispute Resolution', icon: AlertTriangle },
    { path: '/profit-share', label: 'Profit-Share Ledger', icon: PieChart },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-6 flex flex-col justify-between shrink-0 shadow-xl">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">SahakarSeva</h1>
            <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">Cooperative Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{user.name || 'Coop Admin'}</p>
            <span className="text-xs text-slate-500">Pune Cooperative Society</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-slate-400 hover:text-red-400 p-2 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
