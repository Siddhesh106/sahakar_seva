import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Calendar, ChevronRight, Loader2, MapPin } from 'lucide-react';

export default function History() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/bookings?role=customer')
      .then((res) => setBookings(res.bookings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Service Bookings</h1>
          <p className="text-sm text-[#908fa0] mt-1">Track current requests and view past job history</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 bg-[#171b27] p-1 rounded-xl border border-white/[0.08]">
          {['all', 'requested', 'matching', 'assigned', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                filter === f ? 'bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30' : 'text-[#908fa0] hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl text-xs mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#908fa0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#8083ff]" />
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#171b27]/90 rounded-2xl p-12 text-center border border-white/[0.08] shadow-xl">
          <Calendar className="w-12 h-12 text-[#464554] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-[#908fa0] text-sm mt-1 mb-6">You haven't placed any bookings matching this filter yet.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] hover:brightness-110 text-[#0a0e19] font-black px-6 py-3 rounded-xl text-xs shadow-lg shadow-[#8083ff]/20 transition cursor-pointer"
          >
            Book a Service Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/booking/${b.id}`)}
              className="bg-[#171b27]/90 rounded-2xl p-5 border border-white/[0.08] hover:border-[#8083ff]/30 transition cursor-pointer flex items-center justify-between shadow-sm hover:shadow-lg"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-base capitalize">{b.category?.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.status === 'completed' ? 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30' :
                    b.status === 'in_progress' ? 'bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/30' :
                    b.status === 'matching' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-white/[0.06] text-[#908fa0] border border-white/[0.08]'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#c7c4d7] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#908fa0]" /> {b.address_text}
                </p>
                <p className="text-xs text-[#908fa0]">
                  Scheduled: {new Date(b.scheduled_time).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-extrabold text-white">₹{b.price}</span>
                <ChevronRight className="w-5 h-5 text-[#908fa0]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
