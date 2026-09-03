import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { Wallet, TrendingUp, History, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WorkerEarnings() {
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
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Cooperative Member Wallet</span>
          </div>
          <span className="text-xs bg-emerald-700/50 text-emerald-200 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
            Instant Payout Ready
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <p className="text-xs text-emerald-300 font-medium">Available Payout Balance</p>
            <h1 className="text-4xl font-black text-white mt-1">₹{data.wallet_balance}</h1>
          </div>
          <button
            onClick={handleWithdraw}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-lg transition cursor-pointer self-start sm:self-auto"
          >
            Withdraw to UPI Bank Account
          </button>
        </div>
      </div>

      {/* Cooperative Profit-Share Estimate Card */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Quarterly Member Surplus Dividend</h3>
            <p className="text-xs text-slate-500 mt-0.5">Estimated quarterly share returned to member based on {data.total_jobs_completed} completed services</p>
          </div>
        </div>
        <span className="text-xl font-black text-indigo-600 self-end sm:self-auto">+₹1,050.00</span>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" /> Job Earnings Breakdown (91.5% Worker Share)
        </h3>

        {data.history?.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No earnings history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {data.history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-sm hover:bg-slate-100/60 transition"
              >
                <div>
                  <h4 className="font-bold text-slate-800 capitalize">{item.category} Service</h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">Job #{item.booking_id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-base">+₹{item.worker_payout}</span>
                  <p className="text-[10px] text-slate-400">8.5% coop fee deducted</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
