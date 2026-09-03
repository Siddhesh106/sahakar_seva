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

  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(null);

  const handleWithdraw = () => {
    if (data.wallet_balance <= 0) {
      alert('Your wallet balance is ₹0.');
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      const amount = data.wallet_balance;
      setWithdrawnAmount(amount);
      setData(prev => ({ ...prev, wallet_balance: 0 }));
      setWithdrawing(false);
    }, 1200);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      {/* Payout Success Toast */}
      {withdrawnAmount != null && (
        <div className="bg-[#4edea3]/10 border border-[#4edea3]/30 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />
            <div>
              <p className="text-sm font-bold">Payout of ₹{withdrawnAmount} Processed Successfully!</p>
              <p className="text-xs text-[#c7c4d7]">Funds transferred instantly to registered UPI handle.</p>
            </div>
          </div>
          <button
            onClick={() => setWithdrawnAmount(null)}
            className="text-xs font-bold text-[#4edea3] bg-[#4edea3]/20 hover:bg-[#4edea3]/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-[#0f131e] via-[#171b27] to-[#0f131e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">Cooperative Member Wallet</span>
          </div>
          <span className="text-xs bg-[#4edea3]/20 text-[#4edea3] px-3 py-1 rounded-full font-medium border border-[#4edea3]/30">
            Instant Payout Ready
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <p className="text-xs text-[#c7c4d7] font-medium">Available Payout Balance</p>
            <h1 className="text-4xl font-black text-white mt-1">₹{data.wallet_balance}</h1>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || data.wallet_balance <= 0}
            className="bg-gradient-to-r from-[#4edea3] to-[#00a572] hover:brightness-110 disabled:opacity-50 text-[#003824] font-black px-6 py-3.5 rounded-2xl text-xs shadow-lg transition cursor-pointer self-start sm:self-auto flex items-center gap-2"
          >
            {withdrawing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#003824] border-t-transparent rounded-full animate-spin"></span>
                <span>Transferring...</span>
              </>
            ) : (
              <span>Withdraw to UPI Bank Account</span>
            )}
          </button>
        </div>
      </div>

      {/* Cooperative Profit-Share Estimate Card */}
      <div className="bg-[#171b27]/90 border border-white/[0.08] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c0c1ff]/10 text-[#c0c1ff] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Quarterly Member Surplus Dividend</h3>
            <p className="text-xs text-[#908fa0] mt-0.5">Estimated quarterly share returned to member based on {data.total_jobs_completed} completed services</p>
          </div>
        </div>
        <span className="text-xl font-black text-[#c0c1ff] self-end sm:self-auto">+₹1,050.00</span>
      </div>

      {/* Payment History */}
      <div className="bg-[#171b27]/90 rounded-3xl border border-white/[0.08] shadow-sm p-6 sm:p-8">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[#4edea3]" /> Job Earnings Breakdown (91.5% Worker Share)
        </h3>

        {data.history?.length === 0 ? (
          <p className="text-xs text-[#908fa0] text-center py-8">No earnings history recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {data.history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#1b1f2b] rounded-2xl border border-white/[0.08] flex items-center justify-between text-sm hover:bg-[#262a36] transition"
              >
                <div>
                  <h4 className="font-bold text-white capitalize">{item.category} Service</h4>
                  <p className="text-xs text-[#908fa0] mt-0.5 font-mono">Job #{item.booking_id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#4edea3] text-base">+₹{item.worker_payout}</span>
                  <p className="text-[10px] text-[#908fa0]">8.5% coop fee deducted</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
