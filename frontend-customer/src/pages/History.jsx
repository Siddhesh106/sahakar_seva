import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Calendar, ChevronRight, Loader2, MapPin } from 'lucide-react';

export default function History() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/bookings?role=customer')
      .then((res) => setBookings(res.bookings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Service Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Track current requests and view past job history</p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl">
          {['all', 'matching', 'assigned', 'in_progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition ${
                filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Bookings Found</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">You haven't placed any bookings matching this filter yet.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
          >
            Book a Service Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/booking/${b.id}`)}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 text-base capitalize">{b.category?.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                    b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    b.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                    b.status === 'matching' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.address_text}
                </p>
                <p className="text-xs text-slate-400">
                  Scheduled: {new Date(b.scheduled_time).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-slate-800">₹{b.price}</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
