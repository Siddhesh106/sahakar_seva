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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Customer Ratings & Reviews</h1>
        <p className="text-xs text-[#908fa0] mt-1">Direct feedback from cooperative service recipients</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#908fa0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#4edea3]" />
          Loading verified member reviews...
        </div>
      ) : ratings.length === 0 ? (
        <div className="bg-[#171b27]/90 rounded-3xl p-12 text-center border border-white/[0.08] shadow-sm">
          <Star className="w-12 h-12 text-white/[0.08] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Reviews Received Yet</h3>
          <p className="text-xs text-[#908fa0] mt-1">Accept and complete household jobs to receive 5-star customer ratings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((r) => (
            <div key={r.id} className="bg-[#171b27]/90 rounded-2xl p-6 border border-white/[0.08] shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#4edea3]/10 text-[#4edea3] font-bold flex items-center justify-center text-xs">
                    {r.from_user?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">{r.from_user?.name || 'Customer'}</span>
                    <span className="text-[11px] text-[#908fa0] font-mono">{new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {[...Array(Math.max(0, Math.min(5, Math.round(r.stars || 5))))].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-white font-black text-xs">{r.stars || 5}.0★</span>
                </div>
              </div>

              {r.comment ? (
                <p className="text-xs text-[#c7c4d7] bg-[#1b1f2b] p-3.5 rounded-xl border border-white/[0.08] italic leading-relaxed">
                  "{r.comment}"
                </p>
              ) : (
                <p className="text-xs text-[#908fa0] italic">No additional feedback comment.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
