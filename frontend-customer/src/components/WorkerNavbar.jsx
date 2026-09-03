import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Wallet, Shield, Star, LogOut, Wrench, UserCheck } from 'lucide-react';

export default function WorkerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { path: '/worker', label: 'Duty & Jobs', icon: Home },
    { path: '/worker/earnings', label: 'Wallet & Dividend', icon: Wallet },
    { path: '/worker/social-security', label: 'e-Shram / PACS', icon: Shield },
    { path: '/worker/ratings', label: 'Ratings', icon: Star },
    { path: '/worker/kyc', label: 'KYC Status', icon: UserCheck },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/40 text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/worker" className="flex items-center gap-2.5 font-bold text-lg group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <span>Sahakar<span className="text-emerald-400">Worker</span></span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
              Member Partner
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                    isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-emerald-800/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user.name || 'Member'}
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

      {/* Bottom Nav for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 flex justify-around z-40 shadow-2xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
