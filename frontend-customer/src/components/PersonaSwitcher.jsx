import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, User, Wrench, Building2, ChevronDown, Sparkles } from 'lucide-react';

export default function PersonaSwitcher() {
  const { user, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const personas = [
    {
      role: 'customer',
      label: 'Customer',
      name: 'Amit Jain',
      phone: '9000000001',
      icon: User,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      activeColor: 'bg-indigo-600 text-white',
      path: '/'
    },
    {
      role: 'worker',
      label: 'Worker Member',
      name: 'Amit Patil',
      phone: '9000000013',
      icon: Wrench,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      activeColor: 'bg-emerald-600 text-white',
      path: '/worker'
    },
    {
      role: 'coop_admin',
      label: 'Coop Admin',
      name: 'Admin Desai',
      phone: '9000000099',
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      activeColor: 'bg-blue-600 text-white',
      path: '/admin'
    }
  ];

  const currentPersona = personas.find(p => p.role === user.role) || {
    role: user.role,
    label: user.role,
    name: user.name || 'User',
    icon: User,
    color: 'bg-slate-700 text-slate-300 border-slate-600',
    activeColor: 'bg-slate-700 text-white',
    path: '/'
  };

  const handleSwitch = async (persona) => {
    if (user.phone === persona.phone) {
      navigate(persona.path);
      setOpen(false);
      return;
    }
    setSwitching(true);
    try {
      await verifyOtp(persona.phone, '123456');
      navigate(persona.path);
    } catch (err) {
      console.error('Switch error:', err);
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  };

  const IconComp = currentPersona.icon;

  return (
    <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Authority Access:
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${currentPersona.color} text-[11px]`}>
          <IconComp className="w-3 h-3" />
          {currentPersona.label} ({user.name || user.phone})
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 hidden md:inline">Quick Persona Switch:</span>
        <div className="flex items-center gap-1">
          {personas.map(p => {
            const isCurrent = p.role === user.role;
            const PIcon = p.icon;
            return (
              <button
                key={p.role}
                onClick={() => handleSwitch(p)}
                disabled={switching}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  isCurrent
                    ? `${p.activeColor} shadow-sm font-bold`
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title={`Switch to ${p.label}`}
              >
                <PIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{p.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
