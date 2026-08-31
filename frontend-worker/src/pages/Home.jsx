import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { Power, MapPin, Star, ShieldCheck, Clock, CheckCircle2, XCircle, Phone, ArrowRight, Loader2, Navigation } from 'lucide-react';

export default function Home() {
  const [online, setOnline] = useState(true);
  const [earnings, setEarnings] = useState({ wallet_balance: 0, total_jobs_completed: 0 });
  const [pendingOffer, setPendingOffer] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [countdown, setCountdown] = useState(90);
  const [loading, setLoading] = useState(true);

  // Poll for pending offers & active jobs every 3s
  const pollData = async () => {
    try {
      // 1. Fetch pending offer
      const offerRes = await apiFetch('/match/pending');
      setPendingOffer(offerRes.offer);

      // 2. Fetch active assigned/in_progress jobs
      const bookingsRes = await apiFetch('/bookings?role=worker');
      const active = bookingsRes.bookings?.find(
        (b) => b.status === 'assigned' || b.status === 'in_progress'
      );
      setActiveJob(active || null);

      // 3. Fetch earnings summary
      const earnRes = await apiFetch('/workers/me/earnings');
      setEarnings(earnRes);
    } catch (err) {
      console.error('Worker home poll error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pollData();
    const interval = setInterval(pollData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for pending offer
  useEffect(() => {
    if (!pendingOffer) return;

    const expiresAt = new Date(pendingOffer.expires_at).getTime();
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setPendingOffer(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingOffer]);

  const handleToggleOnline = async () => {
    const nextStatus = online ? 'offline' : 'online';
    try {
      await apiFetch('/workers/me/availability', {
        method: 'PUT',
        body: JSON.stringify({
          status: nextStatus,
          lat: 18.5204,
          lng: 73.8567,
        }),
      });
      setOnline(!online);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await apiFetch(`/match/${offerId}/accept`, { method: 'POST' });
      setPendingOffer(null);
      pollData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeclineOffer = async (offerId) => {
    try {
      await apiFetch(`/match/${offerId}/decline`, { method: 'POST' });
      setPendingOffer(null);
      pollData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateJobStatus = async (bookingId, nextStatus) => {
    try {
      await apiFetch(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      pollData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* Availability Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cooperative Duty Status</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-3 h-3 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <h1 className="text-xl font-bold">{online ? 'ONLINE — Accepting Jobs' : 'OFFLINE'}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pune City Center (5km radius)
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition ${
            online
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
        >
          <Power className="w-5 h-5" />
          {online ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* Today's Summary Card */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Wallet Balance</span>
          <p className="text-2xl font-black text-slate-800 mt-1">₹{earnings.wallet_balance || 0}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Ready for instant bank payout</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Jobs Completed</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{earnings.total_jobs_completed || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Fair-Match Member Rating 4.8★</p>
        </div>
      </div>

      {/* PENDING MATCH OFFER MODAL / CARD (The Core Demo Differentiator) */}
      {pendingOffer && (
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-2xl border-2 border-emerald-500 mb-8 animate-bounce-short">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">NEW JOB OFFER</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-mono text-base font-bold bg-slate-800 px-3 py-1 rounded-full border border-amber-500/30">
              <Clock className="w-4 h-4" /> {countdown}s
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white capitalize">{pendingOffer.booking?.category?.name}</h2>
              <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {pendingOffer.booking?.address_text}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Customer: {pendingOffer.booking?.customer?.name || 'Customer'}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-400">₹{pendingOffer.booking?.price}</span>
              <p className="text-[10px] text-slate-400">Fixed Fair Price</p>
            </div>
          </div>

          {/* 🔍 TRANSPARENCY SCORE BREAKDOWN (3-BAR EXPLAINABLE UI) */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-800/60 mb-6">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Fair-Match Score Explanation ({Math.round(pendingOffer.total_score * 100)}% Match)
            </h4>

            <div className="space-y-3">
              {/* Proximity Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Proximity (40% weight)</span>
                  <span className="text-emerald-300 font-bold">{Math.round(pendingOffer.proximity_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pendingOffer.proximity_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Rating Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Member Rating (30% weight)</span>
                  <span className="text-amber-300 font-bold">{Math.round(pendingOffer.rating_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pendingOffer.rating_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Fair Turn / Idle Time Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Fair Turn / Idle Priority (30% weight)</span>
                  <span className="text-purple-300 font-bold">{Math.round(pendingOffer.fairness_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pendingOffer.fairness_score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleDeclineOffer(pendingOffer.id)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition border border-slate-700 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> DECLINE
            </button>
            <button
              onClick={() => handleAcceptOffer(pendingOffer.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> ACCEPT JOB
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE ASSIGNED JOB CARD */}
      {activeJob && (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-md mb-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Active Job ({activeJob.status.replace('_', ' ')})
            </span>
            <span className="text-lg font-bold text-slate-800">₹{activeJob.price}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 capitalize">{activeJob.category?.name}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {activeJob.address_text}
          </p>

          {activeJob.notes && (
            <p className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-600 mt-3 border border-slate-100">
              Notes: "{activeJob.notes}"
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <a
              href={`tel:${activeJob.customer?.phone}`}
              className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5" /> Call Customer
            </a>

            {activeJob.status === 'assigned' && (
              <button
                onClick={() => handleUpdateJobStatus(activeJob.id, 'in_progress')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow"
              >
                MARK STARTED
              </button>
            )}

            {activeJob.status === 'in_progress' && (
              <button
                onClick={() => handleUpdateJobStatus(activeJob.id, 'completed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow"
              >
                MARK COMPLETED
              </button>
            )}
          </div>
        </div>
      )}

      {/* No jobs state */}
      {!pendingOffer && !activeJob && (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Waiting for New Job Offers</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You are online and visible to nearby customers. Keep app open to receive instant Fair-Match offers.
          </p>
        </div>
      )}
    </div>
  );
}
