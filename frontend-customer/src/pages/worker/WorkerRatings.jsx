import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api';
import { Star, MessageSquare, Loader2 } from 'lucide-react';

export default function WorkerRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/ratings/received')
      .then((res) => setRatings(res.ratings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Customer Ratings & Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">Direct feedback from cooperative service recipients</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          Loading verified member reviews...
        </div>
      ) : ratings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
          <Star className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Reviews Received Yet</h3>
          <p className="text-xs text-slate-400 mt-1">Accept and complete household jobs to receive 5-star customer ratings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">{r.from_user?.name || 'Customer'}</span>
                  <span className="text-xs text-slate-400">• {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  {[...Array(r.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-slate-800 font-black">{r.stars}.0★</span>
                </div>
              </div>

              {r.comment ? (
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic">
                  "{r.comment}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No comment provided.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
