import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Phone, KeyRound, UserCheck, Wrench, Building2, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState('phone'); // phone | otp | register
  const [phone, setPhone] = useState('9000000001');
  const [otp, setOtp] = useState('123456');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [lang, setLang] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { requestOtp, verifyOtp, registerUser } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      if (res.isNewUser || !res.user.name) {
        setStep('register');
      } else {
        // Direct to corresponding workspace according to DB authority
        if (res.user.role === 'worker') {
          navigate('/worker');
        } else if (res.user.role === 'coop_admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(name, role, lang);
      if (role === 'worker') {
        navigate('/worker');
      } else if (role === 'coop_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Instant demo persona selection
  const selectPersona = (demoPhone, demoRole) => {
    setPhone(demoPhone);
    setRole(demoRole);
    setOtp('123456');
    setError('');
  };

  const handleQuickLogin = async (demoPhone) => {
    setPhone(demoPhone);
    setOtp('123456');
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(demoPhone, '123456');
      if (res.user.role === 'worker') {
        navigate('/worker');
      } else if (res.user.role === 'coop_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e19] text-[#dfe2f2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#8083ff]/15 via-[#4edea3]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#4edea3] text-white shadow-xl shadow-[#8083ff]/20 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Sahakar<span className="text-[#c0c1ff]">Seva</span>
          </h1>
          <p className="text-xs text-[#908fa0] font-medium">
            Cooperative Household Gig Platform • Unified Authority Portal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#1b1f2b]/90 backdrop-blur-xl rounded-3xl p-7 border border-white/[0.08] shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Persona Switcher Cards */}
          {step === 'phone' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Demo Persona (Instant Database Login):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('9000000001')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    phone === '9000000001'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold">Customer</span>
                  <span className="text-[10px] text-slate-400 font-mono">...0001</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('9000000013')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    phone === '9000000013'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Worker</span>
                  <span className="text-[10px] text-slate-400 font-mono">...0013</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('9000000099')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    phone === '9000000099'
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">Admin</span>
                  <span className="text-[10px] text-slate-400 font-mono">...0099</span>
                </button>
              </div>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-4 pt-2">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">or sign in with mobile</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Mobile Number (India)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit phone"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : (
                  <>
                    <span>Request One-Time Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Enter Verification Code
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Demo OTP: 123456
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono tracking-widest text-center"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Verifying mobile: <span className="font-mono text-slate-300">+91 {phone}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Verify & Enter Workspace'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
              >
                ← Change mobile number
              </button>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">First Time Member Registration</span>
                <h3 className="text-lg font-bold text-white mt-1">Complete Your Profile</h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Member Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="customer">Customer (Request & Pay for Services)</option>
                  <option value="worker">Worker Member (Provide Services & Earn)</option>
                  <option value="coop_admin">Cooperative Society Admin (Verify & Oversee)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg transition cursor-pointer"
              >
                {loading ? 'Registering...' : 'Complete Profile & Enter'}
              </button>
            </form>
          )}
        </div>

        {/* Cooperative Trust Footer */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified Members
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 8.5% Capped Fee
          </span>
        </div>
      </div>
    </div>
  );
}
