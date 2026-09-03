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
      {/* Secondary Worker Subnav */}
      <div className="bg-[#171b27]/80 backdrop-blur-md border-b border-white/[0.06] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Worker Member Hub</span>
            <span className="bg-[#4edea3]/15 text-[#4edea3] text-[10px] font-bold px-2 py-0.5 rounded border border-[#4edea3]/30">
              91.5% Direct Payout
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                    isActive ? 'text-[#4edea3] font-bold' : 'text-[#908fa0] hover:text-[#dfe2f2]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

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
