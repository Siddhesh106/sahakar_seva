import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { Users, Activity, AlertTriangle, UserCheck, CheckCircle2, TrendingUp, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/coop/coop-pune-001/stats')
      .then((res) => setStats(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading cooperative governance statistics...
      </div>
    );
  }

  const statCards = [
    { title: 'Active Workers Today', value: stats?.active_workers || 0, sub: `of ${stats?.total_workers || 15} verified members`, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Jobs In Progress', value: stats?.jobs_in_progress || 0, sub: 'Active live dispatch', icon: Activity, color: 'text-purple-600 bg-purple-50' },
    { title: 'Open Disputes', value: stats?.open_disputes || 0, sub: 'Needs admin review', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { title: 'Pending KYC', value: stats?.pending_kyc || 0, sub: 'Identity verification queue', icon: UserCheck, color: 'text-blue-600 bg-blue-50' },
    { title: 'Completed Services', value: stats?.total_jobs_completed || 0, sub: 'All-time cooperative jobs', icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Pune Cooperative Society — Governance Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time supervision of member activity, jobs, KYC queue, and cooperative metrics</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">{c.value}</span>
                <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fair Match Engine Config Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Active Fair-Match Algorithm Weights</h3>
              <p className="text-xs text-slate-400">Cooperative Society transparent weighting configuration</p>
            </div>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-100">
            Cooperative Policy Fixed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proximity Weight</span>
            <p className="text-3xl font-black text-slate-900 mt-1">40%</p>
            <p className="text-xs text-slate-400 mt-1.5">Haversine distance score clamped within 5.0km radius</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating Weight</span>
            <p className="text-3xl font-black text-slate-900 mt-1">30%</p>
            <p className="text-xs text-slate-400 mt-1.5">Historical average star feedback normalized (1.0 to 5.0★)</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fair-Turn / Idle Weight</span>
            <p className="text-3xl font-black text-slate-900 mt-1">30%</p>
            <p className="text-xs text-slate-400 mt-1.5">Idle time priority prevents member starvation (Cap: 72 hours)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
