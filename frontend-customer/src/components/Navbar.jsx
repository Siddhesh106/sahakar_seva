import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, User, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-white">Sahakar<span className="text-indigo-400">Seva</span></span>
          <span className="hidden sm:inline-block text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30 tracking-wide uppercase">
            Cooperative
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition">
            <Home className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/history" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition">
            <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">My Bookings</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition">
            <User className="w-4 h-4" /> <span className="hidden sm:inline">Profile</span>
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
