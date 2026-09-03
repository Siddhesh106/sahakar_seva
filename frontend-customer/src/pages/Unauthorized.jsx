import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, KeyRound, UserCheck } from 'lucide-react';

export default function Unauthorized() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, verifyOtp, logout } = useAuth();

  const state = location.state || {};
  const currentRole = state.currentRole || user?.role || 'unknown';
  const allowedRoles = state.allowedRoles || [];
  const fromPath = state.from || '/';

  const roleLabels = {
    customer: 'Customer',
    worker: 'Cooperative Worker Member',
    coop_admin: 'Cooperative Society Admin'
  };

  const handleQuickSwitch = async (phone) => {
    try {
      const res = await verifyOtp(phone, '123456');
      if (res.user.role === 'worker') navigate('/worker');
      else if (res.user.role === 'coop_admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      alert('Failed to switch persona: ' + err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Access Restricted by Authority
        </span>

        <h1 className="text-2xl font-black text-slate-800 mt-4">Restricted Surface</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          You are currently authenticated as a{' '}
          <strong className="text-slate-800 font-bold">{roleLabels[currentRole] || currentRole}</strong>.
          {allowedRoles.length > 0 && (
            <span>
              {' '}This workspace requires{' '}
              <strong className="text-indigo-600 font-bold">
                {allowedRoles.map(r => roleLabels[r] || r).join(' or ')}
              </strong>{' '}
              authority.
            </span>
          )}
        </p>

        {/* Demo Persona Quick Switcher */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 my-6 text-left">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            Switch to an Authorized Persona:
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickSwitch('9000000001')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-xs font-semibold text-slate-700 transition"
            >
              <span>🧑 Customer (Amit Jain)</span>
              <span className="text-indigo-600 font-mono">9000000001 →</span>
            </button>
            <button
              onClick={() => handleQuickSwitch('9000000013')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm text-xs font-semibold text-slate-700 transition"
            >
              <span>👷 Worker Member (Amit Patil)</span>
              <span className="text-emerald-600 font-mono">9000000013 →</span>
            </button>
            <button
              onClick={() => handleQuickSwitch('9000000099')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm text-xs font-semibold text-slate-700 transition"
            >
              <span>🏛️ Coop Admin (Admin Desai)</span>
              <span className="text-blue-600 font-mono">9000000099 →</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <span className="text-slate-300">|</span>
          <Link
            to={user?.role === 'worker' ? '/worker' : user?.role === 'coop_admin' ? '/admin' : '/'}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Return to My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
