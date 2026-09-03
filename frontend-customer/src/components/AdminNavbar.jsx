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
    <div className="bg-[#171b27]/80 backdrop-blur-md border-b border-white/[0.06] text-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#618bff] animate-pulse"></span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Cooperative Governance</span>
          <span className="bg-[#618bff]/15 text-[#b4c5ff] text-[10px] font-bold px-2 py-0.5 rounded border border-[#618bff]/30">
            Pune Society #001
          </span>
        </div>

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
                  isActive ? 'text-[#b4c5ff] font-bold' : 'text-[#908fa0] hover:text-[#dfe2f2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
