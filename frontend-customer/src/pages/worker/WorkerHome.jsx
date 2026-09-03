import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import { Power, MapPin, Star, ShieldCheck, Clock, CheckCircle2, XCircle, Phone, ArrowRight, Loader2, Navigation, TrendingUp } from 'lucide-react';

export default function WorkerHome() {
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
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Availability Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Cooperative Duty Status</span>
          <div className="flex items-center gap-2.5">
            <span className={`w-3.5 h-3.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <h1 className="text-2xl font-black">{online ? 'ONLINE — Ready for Jobs' : 'OFFLINE — Paused'}</h1>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pune City Network (5.0 km Fair-Match Radius)
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition cursor-pointer ${
            online
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Power className="w-5 h-5" />
          {online ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* Today's Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Wallet Balance</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md">91.5% Share</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">₹{earnings.wallet_balance || 0}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct payout ready to registered UPI
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Jobs</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">Member Rating</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{earnings.total_jobs_completed || 0}</p>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Fair-Match Priority Active
          </p>
        </div>
      </div>

      {/* ⚡ PENDING MATCH OFFER MODAL (Core Differentiator: 3-Bar Transparency Breakdown) */}
      {pendingOffer && (
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/80 animate-pulse-glow">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">EXCLUSIVE COOPERATIVE OFFER</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-mono text-sm font-bold bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-amber-500/40">
              <Clock className="w-4 h-4 text-amber-400" /> {countdown}s Left
            </div>
          </div>

          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Service Request</span>
              <h2 className="text-2xl font-black text-white capitalize mt-0.5">{pendingOffer.booking?.category?.name || 'Home Service'}</h2>
              <p className="text-xs text-emerald-200 mt-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {pendingOffer.booking?.address_text}
              </p>
              <p className="text-xs text-slate-400 mt-1">Customer: {pendingOffer.booking?.customer?.name || 'Customer'}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">₹{pendingOffer.booking?.price}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Fixed Transparent Rate</p>
            </div>
          </div>

          {/* 🔍 3-BAR EXPLAINABLE FAIR-MATCH SCORE BREAKDOWN */}
          <div className="bg-slate-900/95 rounded-2xl p-5 border border-emerald-800/70 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Fair-Match Score Transparency
              </h4>
              <span className="text-xs font-black bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                {Math.round(pendingOffer.total_score * 100)}% Total Score
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Proximity Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">1. Proximity Match (40% Weight)</span>
                  <span className="text-emerald-300 font-bold">{Math.round(pendingOffer.proximity_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pendingOffer.proximity_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Rating Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">2. Member Rating (30% Weight)</span>
                  <span className="text-emerald-300 font-bold">{Math.round(pendingOffer.rating_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pendingOffer.rating_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Fair Turn / Idle Time Priority Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">3. Fair-Turn Idle Priority (30% Weight)</span>
                  <span className="text-emerald-300 font-bold">{Math.round(pendingOffer.fairness_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pendingOffer.fairness_score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDeclineOffer(pendingOffer.id)}
              className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Pass to Next Member
            </button>
            <button
              onClick={() => handleAcceptOffer(pendingOffer.id)}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition cursor-pointer"
            >
              Accept Job Now
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE JOB CARD */}
      {activeJob && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {activeJob.status === 'assigned' ? 'Assigned Job — Head to Location' : 'Job In Progress'}
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">₹{activeJob.price}</span>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-800 capitalize">{activeJob.category?.name} Service</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> {activeJob.address_text}
            </p>
            {activeJob.notes && (
              <p className="text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 mt-3">
                <strong>Customer Notes:</strong> {activeJob.notes}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Customer: <strong>{activeJob.customer?.name}</strong></span>
            </div>

            {activeJob.status === 'assigned' && (
              <button
                onClick={() => handleUpdateJobStatus(activeJob.id, 'in_progress')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Mark Arrived & Started
              </button>
            )}

            {activeJob.status === 'in_progress' && (
              <button
                onClick={() => handleUpdateJobStatus(activeJob.id, 'completed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Mark Job Completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State when Online but no active offers */}
      {online && !pendingOffer && !activeJob && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Navigation className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Listening for Nearby Service Requests</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            You are active in the Pune Cooperative candidate pool. When a matching request appears, you'll receive a 90-second offer with your transparent Fair-Match score breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
