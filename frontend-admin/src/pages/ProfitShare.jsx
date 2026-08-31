import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { PieChart, TrendingUp, DollarSign, Calendar, Users, Loader2 } from 'lucide-react';

export default function ProfitShare() {
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
      <div className="py-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading profit-share ledger...
      </div>
    );
  }

  const currentSurplus = data?.current_period?.total_surplus || 15750.00;
  const memberEstimate = Math.round((currentSurplus / 15) * 100) / 100;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cooperative Profit-Share Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">
          Transparent quarterly surplus distribution among verified worker-members
        </p>
      </div>

      {/* Current Period Summary Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">Current Quarter ({data?.current_period?.period_label || '2026-Q4'})</span>
          <h2 className="text-3xl font-black text-white mt-1">₹{currentSurplus}</h2>
          <p className="text-xs text-blue-200 mt-1">Total Cooperative Platform Fee Pool Collected</p>
        </div>

        <div>
          <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">Est. Per-Member Dividend</span>
          <h2 className="text-3xl font-black text-emerald-400 mt-1">₹{memberEstimate}</h2>
          <p className="text-xs text-blue-200 mt-1">Based on 15 verified active members</p>
        </div>

        <div className="flex items-center justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow transition">
            Trigger Quarterly Dividend Distribution
          </button>
        </div>
      </div>

      {/* Past Ledger Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" /> Historical Surplus Distributions
          </h3>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Quarter / Period</th>
              <th className="px-6 py-4">Total Surplus Pool</th>
              <th className="px-6 py-4">Distributed At</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.ledger?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">{item.period_label}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">₹{item.total_surplus}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {item.distributed_at ? new Date(item.distributed_at).toLocaleDateString() : 'Pending'}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                    Distributed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
