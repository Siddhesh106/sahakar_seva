import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { AlertTriangle, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState({});

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
    try {
      await apiFetch(`/disputes/${disputeId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolution_notes: notes }),
      });
      fetchDisputes();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading disputes...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dispute Resolution Management</h1>
        <p className="text-sm text-slate-500 mt-1">Review raised customer/worker issues and provide cooperative resolution</p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Open Disputes</h3>
          <p className="text-xs text-slate-500 mt-1">All bookings running smoothly across cooperative members.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-slate-800 text-base">Dispute #{d.id.slice(0, 8)}</span>
                  <span className="text-xs text-slate-400">• Booking #{d.booking_id.slice(0, 8)}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  d.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Raised By</span>
                  <p className="font-bold text-slate-800 mt-0.5">{d.raiser?.name} ({d.raiser?.role})</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase">Reason</span>
                  <p className="font-bold text-slate-800 mt-0.5">{d.reason}</p>
                </div>
              </div>

              {d.status === 'open' ? (
                <div className="space-y-3">
                  <textarea
                    value={resolutionNotes[d.id] || ''}
                    onChange={(e) => setResolutionNotes({ ...resolutionNotes, [d.id]: e.target.value })}
                    placeholder="Enter resolution notes..."
                    rows="2"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleResolve(d.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow transition"
                  >
                    Resolve Dispute
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs border border-emerald-100">
                  <span className="font-bold">Resolution Notes: </span> {d.resolution_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
