import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Wallet, Shield, Star, LogOut, Wrench } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/earnings', label: 'Wallet', icon: Wallet },
    { path: '/social-security', label: 'e-Shram/PACS', icon: Shield },
    { path: '/ratings', label: 'Reviews', icon: Star },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <span>Sahakar<span className="text-emerald-400">Worker</span></span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
              Partner
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user.name || 'Member'}
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Nav for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 flex justify-around z-50 shadow-lg md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
