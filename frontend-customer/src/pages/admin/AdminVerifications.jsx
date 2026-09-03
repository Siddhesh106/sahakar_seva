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
      <div className="py-20 text-center text-[#908fa0]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#b4c5ff]" />
        Loading verification queue...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black text-white">Worker KYC Verification Queue</h1>
        <p className="text-xs text-[#c7c4d7] mt-1">Review identity documents and verify cooperative worker members</p>
      </div>

      <div className="bg-[#171b27]/90 rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#c7c4d7]">
            <thead className="bg-[#1b1f2b] border-b border-white/[0.08] text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Worker Member</th>
                <th className="px-6 py-4">Skill Categories</th>
                <th className="px-6 py-4">KYC Document</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {workers.map((w) => (
                <tr key={w.user_id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#618bff]/15 text-[#b4c5ff] flex items-center justify-center font-bold text-sm">
                        {w.user?.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{w.user?.name}</p>
                        <span className="text-xs text-[#908fa0] font-mono">+91 {w.user?.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {w.skill_categories?.map((cat) => (
                        <span key={cat} className="px-2 py-0.5 bg-[#0f131e] border border-white/[0.08] text-[#c7c4d7] rounded-md text-[11px] font-semibold capitalize">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="font-bold uppercase text-[#c7c4d7]">{w.kyc_doc_type || 'Aadhaar'}</span>
                    <p className="text-[#908fa0]">{w.kyc_doc_number || '1234 5678 9012'}</p>
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
                        className="bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
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
