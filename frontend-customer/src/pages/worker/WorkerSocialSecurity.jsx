import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { ShieldCheck, Building2, CreditCard, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default function WorkerSocialSecurity() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkingEshram, setLinkingEshram] = useState(false);
  const [pacsAmount, setPacsAmount] = useState('2000');
  const [requestingPacs, setRequestingPacs] = useState(false);
  const [pacsResult, setPacsResult] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/social-security/status');
      setStatus(res.social_security);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLinkEshram = async () => {
    setLinkingEshram(true);
    try {
      await apiFetch('/social-security/eshram-link', { method: 'POST' });
      fetchStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setLinkingEshram(false);
    }
  };

  const handlePACSCredit = async (e) => {
    e.preventDefault();
    setRequestingPacs(true);
    try {
      const res = await apiFetch('/social-security/pacs-credit-request', {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(pacsAmount) }),
      });
      setPacsResult(res);
      fetchStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setRequestingPacs(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
        Loading Social Security linkages...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Institutional Social Security & PACS Credit</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cooperative member benefits: e-Shram national portal linkage & Primary Agricultural Credit Society micro-advances.
        </p>
      </div>

      {/* Card 1: e-Shram Portal Integration */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">National e-Shram Registry Link</h3>
              <p className="text-xs text-slate-500">Government unorganized worker database linkage</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status?.eshram_status === 'linked' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {status?.eshram_status === 'linked' ? 'LINKED ✅' : 'NOT LINKED'}
          </span>
        </div>

        {status?.eshram_status === 'linked' ? (
          <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl text-sm border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Universal Account Number (UAN)</span>
              <p className="font-mono font-black text-lg mt-0.5">{status.eshram_id}</p>
            </div>
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Linking your e-Shram UAN provides accident insurance coverage up to ₹2 Lakhs, pension benefits, and official worker recognition under the Ministry of Labour & Employment.
            </p>
            <button
              onClick={handleLinkEshram}
              disabled={linkingEshram}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-2xl text-xs transition shadow flex items-center gap-2 cursor-pointer"
            >
              {linkingEshram ? <Loader2 className="w-4 h-4 animate-spin" /> : 'One-Tap Link e-Shram UAN'}
            </button>
          </div>
        )}
      </div>

      {/* Card 2: PACS Credit / Advance Facility */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Local PACS Credit Advance</h3>
              <p className="text-xs text-slate-500">Primary Agricultural Credit Society micro-loan advance against earnings</p>
            </div>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
            Credit Limit: ₹{status?.credit_limit ?? 5000}
          </span>
        </div>

        {pacsResult && (
          <div className={`p-4 rounded-2xl text-sm border mb-4 ${
            pacsResult.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'
          }`}>
            <h4 className="font-bold capitalize">Credit Request {pacsResult.status}!</h4>
            <p className="text-xs mt-1">
              {pacsResult.status === 'approved'
                ? `₹${pacsResult.amount} has been credited to your wallet instantly. Remaining credit limit: ₹${pacsResult.credit_limit}.`
                : pacsResult.reason}
            </p>
          </div>
        )}

        <form onSubmit={handlePACSCredit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Request Advance Amount (₹)</label>
            <input
              type="number"
              value={pacsAmount}
              onChange={(e) => setPacsAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
              max={status?.credit_limit ?? 5000}
              required
            />
          </div>

          <button
            type="submit"
            disabled={requestingPacs}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs transition shadow flex items-center gap-2 cursor-pointer"
          >
            {requestingPacs ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request PACS Advance'}
          </button>
        </form>
      </div>
    </div>
  );
}
