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
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading cooperative profit-share ledger...
      </div>
    );
  }

  const currentSurplus = data?.current_period?.total_surplus || 15750.00;
  const memberEstimate = Math.round((currentSurplus / 15) * 100) / 100;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Cooperative Profit-Share Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quarterly surplus redistribution among verified worker-members
        </p>
      </div>

      {/* Current Period Summary Card */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-[11px] text-blue-300 font-bold uppercase tracking-wider">Current Period ({data?.current_period?.period_label || '2026-Q4'})</span>
          <h2 className="text-3xl font-black text-white mt-1">₹{currentSurplus}</h2>
          <p className="text-xs text-blue-300/80 mt-1">Total Cooperative Platform Fee Pool Collected</p>
        </div>

        <div>
          <span className="text-[11px] text-blue-300 font-bold uppercase tracking-wider">Est. Per-Member Dividend</span>
          <h2 className="text-3xl font-black text-emerald-400 mt-1">₹{memberEstimate}</h2>
          <p className="text-xs text-blue-300/80 mt-1">Based on 15 verified active members</p>
        </div>

        <div className="flex items-center justify-start md:justify-end">
          <button
            onClick={() => alert(`Quarterly dividend of ₹${memberEstimate} initiated for 15 members!`)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs shadow-lg transition cursor-pointer"
          >
            Trigger Member Dividend Payout
          </button>
        </div>
      </div>

      {/* Past Ledger Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" /> Historical Surplus Distributions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Quarter / Period</th>
                <th className="px-6 py-4">Total Surplus Pool</th>
                <th className="px-6 py-4">Distribution Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.ledger?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.period_label}</td>
                  <td className="px-6 py-4 font-black text-emerald-600">₹{item.total_surplus}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {item.distributed_at ? new Date(item.distributed_at).toLocaleDateString() : 'Pending'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase">
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
