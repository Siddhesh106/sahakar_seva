import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { AlertTriangle, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  const fetchDisputes = async () => {
    try {
      const res = await apiFetch('/disputes');
      setDisputes(res.disputes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (disputeId) => {
    const notes = resolutionNotes[disputeId] || 'Resolved by coop admin after review.';
    setResolvingId(disputeId);
    try {
      await apiFetch(`/disputes/${disputeId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolution_notes: notes }),
      });
      await fetchDisputes();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#908fa0]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#b4c5ff]" />
        Loading disputes...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black text-white">Dispute Resolution Management</h1>
        <p className="text-xs text-[#c7c4d7] mt-1">Review raised customer/worker issues and provide official cooperative resolution</p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-[#171b27]/90 rounded-2xl p-12 text-center border border-white/[0.08] shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Open Disputes</h3>
          <p className="text-xs text-[#908fa0] mt-1">All service dispatches running smoothly across cooperative members.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-[#171b27]/90 rounded-2xl border border-white/[0.08] shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-white text-base">Dispute #{d.id.slice(0, 8)}</span>
                  <span className="text-xs text-[#908fa0] font-mono">• Booking #{d.booking_id.slice(0, 8)}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  d.status === 'open' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#c7c4d7] bg-[#0f131e] p-4 rounded-2xl border border-white/[0.08]">
                <div>
                  <span className="font-semibold text-[#908fa0] uppercase">Raised By</span>
                  <p className="font-bold text-white mt-0.5">{d.raiser?.name} ({d.raiser?.role})</p>
                </div>
                <div>
                  <span className="font-semibold text-[#908fa0] uppercase">Reason</span>
                  <p className="font-bold text-white mt-0.5">{d.reason}</p>
                </div>
              </div>

              {d.status === 'open' ? (
                <div className="space-y-3 pt-1">
                  <textarea
                    value={resolutionNotes[d.id] || ''}
                    onChange={(e) => setResolutionNotes({ ...resolutionNotes, [d.id]: e.target.value })}
                    placeholder="Enter binding cooperative resolution notes..."
                    rows="2"
                    className="w-full p-3.5 bg-[#0f131e] border border-white/[0.08] rounded-xl text-xs text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#8083ff] focus:ring-2 focus:ring-[#8083ff]/20"
                  />
                  <button
                    onClick={() => handleResolve(d.id)}
                    disabled={resolvingId === d.id}
                    className="bg-gradient-to-r from-[#618bff] to-[#494bd6] hover:opacity-90 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    {resolvingId === d.id ? 'Recording Resolution...' : 'Resolve Dispute'}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-xs border border-emerald-500/20">
                  <span className="font-bold">Resolution Recorded: </span> {d.resolution_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
