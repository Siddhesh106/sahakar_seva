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
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Wrench className="w-6 h-6 text-emerald-300" />
            <span>Sahakar<span className="text-emerald-300">Member</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-700 text-emerald-100 px-3 py-1 rounded-full font-medium">
              {user.name || 'Member'}
            </span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-emerald-200 hover:text-white p-1 rounded transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
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
