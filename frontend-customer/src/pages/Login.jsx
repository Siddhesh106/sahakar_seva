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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#8083ff]/12 via-[#4edea3]/8 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#618bff]/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8083ff] via-[#c0c1ff] to-[#4edea3] text-white shadow-2xl shadow-[#8083ff]/30 mb-1 border border-white/20">
            <ShieldCheck className="w-9 h-9 drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Sahakar<span className="text-[#c0c1ff]">Seva</span>
              <span className="ml-2 bg-[#8083ff]/20 text-[#c0c1ff] text-[10px] font-bold px-2 py-1 rounded border border-[#8083ff]/30 tracking-widest align-middle">
                COOP
              </span>
            </h1>
            <p className="text-xs text-[#908fa0] font-medium mt-1.5 tracking-wide">
              Democratic Gig Federation • Unified Authority Portal
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#171b27] border border-white/[0.08] px-3 py-1.5 rounded-lg text-[10px] font-mono text-[#c7c4d7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span>PUNE DISTRICT CLUSTER #04 • NETWORK LIVE</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#1b1f2b]/90 backdrop-blur-xl rounded-3xl p-7 border border-white/[0.08] shadow-2xl shadow-black/40 space-y-6">
          {error && (
            <div className="bg-[#690005]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs p-3.5 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Persona Switcher Cards */}
          {step === 'phone' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider block">
                Select Demo Persona (Instant Login):
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('9000000001')}
                  disabled={loading}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer group disabled:opacity-50 ${
                    phone === '9000000001'
                      ? 'bg-[#c0c1ff]/15 border-[#c0c1ff]/50 text-white shadow-lg shadow-[#c0c1ff]/10'
                      : 'bg-[#0f131e] border-white/[0.08] text-[#c7c4d7] hover:bg-[#262a36] hover:border-[#c0c1ff]/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#c0c1ff]/15 flex items-center justify-center group-hover:bg-[#c0c1ff]/20 transition">
                    <User className="w-4 h-4 text-[#c0c1ff]" />
                  </div>
                  <span className="text-xs font-bold">Consumer</span>
                  <span className="text-[9px] text-[#908fa0] font-mono">...0001</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('9000000013')}
                  disabled={loading}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer group disabled:opacity-50 ${
                    phone === '9000000013'
                      ? 'bg-[#4edea3]/15 border-[#4edea3]/50 text-white shadow-lg shadow-[#4edea3]/10'
                      : 'bg-[#0f131e] border-white/[0.08] text-[#c7c4d7] hover:bg-[#262a36] hover:border-[#4edea3]/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#4edea3]/15 flex items-center justify-center group-hover:bg-[#4edea3]/20 transition">
                    <Wrench className="w-4 h-4 text-[#4edea3]" />
                  </div>
                  <span className="text-xs font-bold">Worker</span>
                  <span className="text-[9px] text-[#908fa0] font-mono">...0013</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('9000000099')}
                  disabled={loading}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer group disabled:opacity-50 ${
                    phone === '9000000099'
                      ? 'bg-[#618bff]/15 border-[#618bff]/50 text-white shadow-lg shadow-[#618bff]/10'
                      : 'bg-[#0f131e] border-white/[0.08] text-[#c7c4d7] hover:bg-[#262a36] hover:border-[#618bff]/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#618bff]/15 flex items-center justify-center group-hover:bg-[#618bff]/20 transition">
                    <Building2 className="w-4 h-4 text-[#618bff]" />
                  </div>
                  <span className="text-xs font-bold">Coop Admin</span>
                  <span className="text-[9px] text-[#908fa0] font-mono">...0099</span>
                </button>
              </div>

              {/* Loading overlay during quick login */}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="w-4 h-4 border-2 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-xs text-[#c0c1ff] font-medium">Authenticating persona...</span>
                </div>
              )}
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/[0.08]"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#908fa0] tracking-wider">or sign in with mobile</span>
                <div className="flex-grow border-t border-white/[0.08]"></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#908fa0] uppercase tracking-wider mb-2">
                  Mobile Number (India)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6c6b7c] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit phone"
                    className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#c0c1ff]/50 focus:ring-2 focus:ring-[#c0c1ff]/15 text-sm font-mono transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] hover:from-[#9395ff] hover:to-[#d0d1ff] active:scale-[0.99] text-[#0a0e19] font-black py-3.5 rounded-xl text-sm shadow-lg shadow-[#8083ff]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
              <div className="text-center pb-1">
                <span className="text-xs font-bold text-[#c0c1ff] uppercase tracking-wider">Authority Verification</span>
                <h3 className="text-lg font-bold text-white mt-1">Enter OTP Code</h3>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
                    Verification Code
                  </label>
                  <span className="text-[11px] font-mono text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-2 py-0.5 rounded">
                    Demo OTP: 123456
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#6c6b7c] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#4edea3]/50 focus:ring-2 focus:ring-[#4edea3]/15 text-sm font-mono tracking-widest text-center transition"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-[11px] text-[#908fa0] mt-2">
                  Verifying mobile: <span className="font-mono text-[#c7c4d7]">+91 {phone}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#4edea3] to-[#00a572] hover:from-[#5ee8ad] hover:to-[#00b57c] active:scale-[0.99] text-[#003824] font-black py-3.5 rounded-xl text-sm shadow-lg shadow-[#4edea3]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#003824] border-t-transparent rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Enter Workspace</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs text-[#908fa0] hover:text-white pt-1 cursor-pointer transition"
              >
                ← Change mobile number
              </button>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center pb-2">
                <span className="text-xs font-bold text-[#c0c1ff] uppercase tracking-wider">First Time Member Registration</span>
                <h3 className="text-lg font-bold text-white mt-1">Complete Your Profile</h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#908fa0] uppercase tracking-wider mb-2">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#c0c1ff]/50 focus:ring-2 focus:ring-[#c0c1ff]/15 text-sm transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#908fa0] uppercase tracking-wider mb-2">Member Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#c0c1ff]/50 focus:ring-2 focus:ring-[#c0c1ff]/15 text-sm transition"
                >
                  <option value="customer">Customer (Request & Pay for Services)</option>
                  <option value="worker">Worker Member (Provide Services & Earn)</option>
                  <option value="coop_admin">Cooperative Society Admin (Verify & Oversee)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] hover:from-[#9395ff] hover:to-[#d0d1ff] text-[#0a0e19] font-black py-3.5 rounded-xl text-sm shadow-lg shadow-[#8083ff]/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0a0e19] border-t-transparent rounded-full animate-spin"></span>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Complete Profile & Enter</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Cooperative Trust Footer */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-[#908fa0]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" /> 100% Verified Members
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" /> 8.5% Capped Fee
          </span>
        </div>

        {/* Ledger Status */}
        <div className="text-center">
          <span className="text-[9px] font-mono text-[#6c6b7c] tracking-wide">
            HASH: #PUN-COOP-88219 • NODE ONLINE • v2.0.0-sovereign
          </span>
        </div>
      </div>
    </div>
  );
}
