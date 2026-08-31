import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Users, Activity, AlertTriangle, UserCheck, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pune Coop ID: coop-pune-001
    apiFetch('/coop/coop-pune-001/stats')
      .then((res) => setStats(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading cooperative stats...
      </div>
    );
  }

  const statCards = [
    { title: 'Active Workers Today', value: stats?.active_workers || 0, sub: `of ${stats?.total_workers || 15} total members`, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Jobs In Progress', value: stats?.jobs_in_progress || 0, sub: 'Live active jobs', icon: Activity, color: 'text-purple-600 bg-purple-50' },
    { title: 'Open Disputes', value: stats?.open_disputes || 0, sub: 'Needs admin review', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { title: 'Pending KYC', value: stats?.pending_kyc || 0, sub: 'Awaiting verification', icon: UserCheck, color: 'text-blue-600 bg-blue-50' },
    { title: 'Total Jobs Completed', value: stats?.total_jobs_completed || 0, sub: 'All-time platform jobs', icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pune Cooperative Society Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time overview of member activity, jobs, KYC queue and disputes</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</span>
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Active Fair-Match Algorithm Weights
          </h3>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
            Cooperative Settings Override
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Proximity Weight</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">40%</p>
            <p className="text-xs text-slate-400 mt-1">Distance score (0-5km radius)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Rating Weight</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">30%</p>
            <p className="text-xs text-slate-400 mt-1">Member average rating (1-5★)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Fairness / Idle Weight</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">30%</p>
            <p className="text-xs text-slate-400 mt-1">Idle time priority (Cap: 72 hours)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
