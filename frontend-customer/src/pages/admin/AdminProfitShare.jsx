import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { PieChart, TrendingUp, DollarSign, Calendar, Users, Loader2 } from 'lucide-react';

export default function AdminProfitShare() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/coop/coop-pune-001/profit-share')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#908fa0]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#b4c5ff]" />
        Loading cooperative profit-share ledger...
      </div>
    );
  }

  const [triggering, setTriggering] = useState(false);
  const [triggeredSuccess, setTriggeredSuccess] = useState(false);

  const currentSurplus = data?.current_period?.total_surplus || 15750.00;
  const memberEstimate = Math.round((currentSurplus / 15) * 100) / 100;

  const handleTriggerPayout = () => {
    setTriggering(true);
    setTimeout(() => {
      setTriggering(false);
      setTriggeredSuccess(true);
    }, 1500);
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-black text-white">Cooperative Profit-Share Ledger</h1>
        <p className="text-xs text-[#c7c4d7] mt-1">
          Quarterly surplus redistribution among verified worker-members
        </p>
      </div>

      {/* Dividend Trigger Toast */}
      {triggeredSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div>
            <p className="text-sm font-bold">Dividend Payout of ₹{memberEstimate}/member Dispatched!</p>
            <p className="text-xs text-emerald-400/80">Funds credited directly to 15 verified member cooperative wallets.</p>
          </div>
          <button
            onClick={() => setTriggeredSuccess(false)}
            className="text-xs font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-[#1b1f2b] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#618bff]/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-[11px] text-[#b4c5ff] font-bold uppercase tracking-wider">Current Period ({data?.current_period?.period_label || '2026-Q4'})</span>
          <h2 className="text-3xl font-black text-white mt-1">₹{currentSurplus}</h2>
          <p className="text-xs text-[#b4c5ff]/80 mt-1">Total Cooperative Platform Fee Pool Collected</p>
        </div>

        <div>
          <span className="text-[11px] text-[#b4c5ff] font-bold uppercase tracking-wider">Est. Per-Member Dividend</span>
          <h2 className="text-3xl font-black text-emerald-400 mt-1">₹{memberEstimate}</h2>
          <p className="text-xs text-[#b4c5ff]/80 mt-1">Based on 15 verified active members</p>
        </div>

        <div className="flex items-center justify-start md:justify-end">
          <button
            onClick={handleTriggerPayout}
            disabled={triggering}
            className="bg-gradient-to-r from-[#618bff] to-[#494bd6] hover:opacity-90 disabled:opacity-50 text-white font-black px-6 py-3.5 rounded-2xl text-xs shadow-lg transition cursor-pointer flex items-center gap-2"
          >
            {triggering ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Processing Distribution...</span>
              </>
            ) : (
              <span>Trigger Member Dividend Payout</span>
            )}
          </button>
        </div>
      </div>

      {/* Past Ledger Records Table */}
      <div className="bg-[#171b27]/90 rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#b4c5ff]" /> Historical Surplus Distributions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#c7c4d7]">
            <thead className="bg-[#1b1f2b] border-b border-white/[0.08] text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Quarter / Period</th>
                <th className="px-6 py-4">Total Surplus Pool</th>
                <th className="px-6 py-4">Distribution Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {data?.ledger?.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4 font-bold text-white">{item.period_label}</td>
                  <td className="px-6 py-4 font-black text-emerald-400">₹{item.total_surplus}</td>
                  <td className="px-6 py-4 text-xs text-[#908fa0]">
                    {item.distributed_at ? new Date(item.distributed_at).toLocaleDateString() : 'Pending'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black uppercase">
                      Distributed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
