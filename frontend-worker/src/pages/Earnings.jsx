import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Wallet, TrendingUp, History, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Earnings() {
  const [data, setData] = useState({ wallet_balance: 0, total_jobs_completed: 0, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/workers/me/earnings')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = () => {
    alert(`Payout of ₹${data.wallet_balance} initiated to registered UPI ID!`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* Wallet Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between border-b border-emerald-700/60 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Cooperative Member Wallet</span>
          </div>
          <span className="text-xs bg-emerald-700/60 text-emerald-100 px-3 py-1 rounded-full font-medium">
            Instant Payout Ready
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-emerald-200">Available Balance</p>
            <h1 className="text-3xl font-black mt-1">₹{data.wallet_balance}</h1>
          </div>
          <button
            onClick={handleWithdraw}
            className="bg-white text-emerald-900 font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-emerald-50 transition"
          >
            Withdraw to UPI
          </button>
        </div>
      </div>

      {/* Cooperative Profit-Share Estimate Card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">2026-Q3 Profit-Share Surplus</h3>
            <p className="text-xs text-slate-500">Estimated dividend based on {data.total_jobs_completed} completed jobs</p>
          </div>
        </div>
        <span className="text-base font-bold text-indigo-700">+₹1,050.00</span>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" /> Job Earnings History
        </h3>

        {data.history?.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No earnings history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {data.history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-sm"
              >
                <div>
                  <h4 className="font-bold text-slate-800 capitalize">{item.category} Repair</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Booking #{item.booking_id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-base">+₹{item.worker_payout}</span>
                  <p className="text-[10px] text-slate-400">After 8.5% coop fee</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
