import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, User, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <ShieldCheck className="w-7 h-7 text-indigo-200" />
          <span>Sahakar<span className="text-indigo-200">Seva</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 hover:text-indigo-200 text-sm font-medium">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link to="/history" className="flex items-center gap-1 hover:text-indigo-200 text-sm font-medium">
            <Calendar className="w-4 h-4" /> My Bookings
          </Link>
          <Link to="/profile" className="flex items-center gap-1 hover:text-indigo-200 text-sm font-medium">
            <User className="w-4 h-4" /> Profile
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1 text-xs bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
