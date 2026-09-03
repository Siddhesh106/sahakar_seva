import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { UserCheck, CheckCircle2, XCircle, Clock, FileText, Loader2 } from 'lucide-react';

export default function AdminVerifications() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await apiFetch('/coop/coop-pune-001/members');
      setWorkers(res.workers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleVerify = async (workerId, kyc_status) => {
    setProcessingId(workerId);
    try {
      await apiFetch(`/coop/coop-pune-001/verify-worker/${workerId}`, {
        method: 'POST',
        body: JSON.stringify({ kyc_status }),
      });
      await fetchMembers();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading verification queue...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Worker KYC Verification Queue</h1>
        <p className="text-xs text-slate-500 mt-1">Review identity documents and verify cooperative worker members</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Worker Member</th>
                <th className="px-6 py-4">Skill Categories</th>
                <th className="px-6 py-4">KYC Document</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workers.map((w) => (
                <tr key={w.user_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {w.user?.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{w.user?.name}</p>
                        <span className="text-xs text-slate-400 font-mono">+91 {w.user?.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {w.skill_categories?.map((cat) => (
                        <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold capitalize">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="font-bold uppercase text-slate-700">{w.kyc_doc_type || 'Aadhaar'}</span>
                    <p className="text-slate-400">{w.kyc_doc_number || '1234 5678 9012'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                      w.kyc_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      w.kyc_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.kyc_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {w.kyc_status !== 'verified' && (
                      <button
                        onClick={() => handleVerify(w.user_id, 'verified')}
                        disabled={processingId === w.user_id}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        {processingId === w.user_id ? 'Updating...' : 'Approve'}
                      </button>
                    )}
                    {w.kyc_status !== 'rejected' && (
                      <button
                        onClick={() => handleVerify(w.user_id, 'rejected')}
                        disabled={processingId === w.user_id}
                        className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
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
