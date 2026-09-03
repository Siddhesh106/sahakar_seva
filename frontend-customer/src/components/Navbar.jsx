import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Bell, User as UserIcon, LogOut, ChevronDown, Check } from 'lucide-react';

export default function Navbar() {
  const { user, verifyOtp, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [switching, setSwitching] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const personas = [
    { role: 'customer', label: 'Consumer', phone: '9000000001', path: '/' },
    { role: 'worker', label: 'Worker', phone: '9000000013', path: '/worker' },
    { role: 'coop_admin', label: 'Coop', phone: '9000000099', path: '/admin' },
  ];

  const handlePersonaSwitch = async (p) => {
    if (user.role === p.role) {
      navigate(p.path);
      return;
    }
    setSwitching(true);
    try {
      await verifyOtp(p.phone, '123456');
      navigate(p.path);
    } catch (err) {
      console.error('Persona switch error:', err);
    } finally {
      setSwitching(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', targetRole: 'customer' },
    { label: 'My Bookings', path: '/history', targetRole: 'customer' },
    { label: 'Fair-Match Transparency', path: '/worker', targetRole: 'worker' },
    { label: 'Coop Governance', path: '/admin', targetRole: 'coop_admin' },
    { label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = async (e, link) => {
    e.preventDefault();
    if (link.targetRole && user.role !== link.targetRole) {
      setSwitching(true);
      try {
        const targetPersona = personas.find((p) => p.role === link.targetRole);
        if (targetPersona) {
          await verifyOtp(targetPersona.phone, '123456');
        }
        navigate(link.path);
      } catch (err) {
        console.error('Nav switch error:', err);
        navigate(link.path);
      } finally {
        setSwitching(false);
      }
    } else {
      navigate(link.path);
    }
  };

  return (
    <header className="bg-[#0f131e]/95 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-50 text-white shadow-2xl">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand + Cluster Badge */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1b1f2b] border border-white/[0.12] flex items-center justify-center text-[#c0c1ff] shadow-inner group-hover:border-[#c0c1ff]/50 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-lg text-white tracking-tight">Sahakar<span className="text-[#c0c1ff]">Seva</span></span>
                <span className="bg-[#8083ff]/20 text-[#c0c1ff] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#8083ff]/30 tracking-wider">
                  COOP
                </span>
              </div>
              <p className="text-[10px] text-[#908fa0] font-medium tracking-wide mt-0.5">
                Democratic Gig Federation
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 bg-[#171b27] border border-white/[0.08] px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-[#c7c4d7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span>PUNE DISTRICT CLUSTER #04</span>
          </div>
        </div>

        {/* Center: Main Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#c7c4d7]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/' && (location.pathname === '/customer' || location.pathname === '/'));
            return (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`transition-colors hover:text-white cursor-pointer ${
                  isActive ? 'text-white font-semibold' : ''
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Persona Capsules + Quick Controls */}
        <div className="flex items-center gap-2.5">
          {/* Persona Capsule Switcher */}
          <div className="bg-[#171b27] p-1 rounded-full border border-white/[0.08] flex items-center gap-1 shadow-inner">
            {personas.map((p) => {
              const isActive = user.role === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => handlePersonaSwitch(p)}
                  disabled={switching}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8083ff] to-[#6366f1] text-white shadow-md shadow-[#8083ff]/25 font-bold'
                      : 'text-[#908fa0] hover:text-[#dfe2f2] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#908fa0]'}`}></span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Notification Button */}
          <button
            onClick={() => alert('Cooperative network is healthy. All 8.5% fee caps active.')}
            className="w-9 h-9 rounded-full bg-[#171b27] border border-white/[0.08] text-[#c7c4d7] hover:text-white hover:bg-[#262a36] flex items-center justify-center transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Profile / Logout Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8083ff]/30 to-[#618bff]/30 border border-[#c0c1ff]/30 text-[#c0c1ff] hover:border-[#c0c1ff] flex items-center justify-center font-bold text-xs transition cursor-pointer"
              title="Account Menu"
            >
              {user.name?.charAt(0) || 'U'}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1b1f2b] border border-white/[0.12] rounded-2xl p-2 shadow-2xl z-50 animate-fade-in text-xs">
                <div className="p-2.5 border-b border-white/[0.08] mb-1">
                  <p className="font-bold text-white text-sm">{user.name || 'Member'}</p>
                  <p className="text-[11px] text-[#908fa0] font-mono">+91 {user.phone}</p>
                  <span className="inline-block mt-1 bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {user.role} authority
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-[#c7c4d7] hover:text-white hover:bg-white/[0.06] transition"
                >
                  <UserIcon className="w-4 h-4" /> Profile Settings
                </Link>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-xl text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

