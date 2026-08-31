import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Star, MessageSquare, Loader2 } from 'lucide-react';

export default function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/ratings/received')
      .then((res) => setRatings(res.ratings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customer Ratings & Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">Feedback received for completed jobs across services</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          Loading reviews...
        </div>
      ) : ratings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Reviews Received Yet</h3>
          <p className="text-xs text-slate-400 mt-1">Complete jobs to receive customer ratings & reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">{r.from_user?.name || 'Customer'}</span>
                  <span className="text-xs text-slate-400">• {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  {[...Array(r.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-slate-700">{r.stars}.0</span>
                </div>
              </div>

              {r.comment ? (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{r.comment}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No comment left.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
