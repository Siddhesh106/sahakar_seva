import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { MapPin, Calendar, Clock, FileText, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

const CATEGORY_DATA = {
  cleaning: { name: 'Home Cleaning', base_price: 300, unit: 'per_job' },
  plumbing: { name: 'Plumbing Repair', base_price: 400, unit: 'per_job' },
  electrical: { name: 'Electrical Works', base_price: 350, unit: 'per_job' },
  tutoring: { name: 'Home Tutoring', base_price: 500, unit: 'per_hour' },
  elder_care: { name: 'Elder Care', base_price: 450, unit: 'per_hour' },
  cooking: { name: 'Home Cook', base_price: 350, unit: 'per_job' },
  gardening: { name: 'Gardening & Plants', base_price: 250, unit: 'per_job' },
  event_help: { name: 'Event Helper', base_price: 600, unit: 'per_job' },
};

export default function NewBooking() {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const service = CATEGORY_DATA[categoryName] || { name: categoryName, base_price: 350, unit: 'per_job' };

  const initialNotes = searchParams.get('notes') || '';
  const initialUrgency = searchParams.get('urgency') || '';

  const [address, setAddress] = useState('12 MG Road, Pune');
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const savedAddresses = [
    { label: 'Home', address_text: '12 MG Road, Pune', lat: 18.5204, lng: 73.8567 },
    { label: 'Office', address_text: '45 FC Road, Pune', lat: 18.5167, lng: 73.8412 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const scheduled_time = new Date(`${date}T${time}:00+05:30`).toISOString();
      const res = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          category_id: categoryName,
          address_text: address,
          lat,
          lng,
          scheduled_time,
          notes,
        }),
      });

      // Redirect to booking status tracking page
      navigate(`/booking/${res.booking.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#908fa0] hover:text-white transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      <div className="bg-[#171b27]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div>
            <span className="text-[11px] font-bold text-[#c0c1ff] uppercase tracking-wider block">Service Dispatch Order</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 capitalize">{service.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-[#c0c1ff]">₹{service.base_price}</span>
            <p className="text-xs text-[#908fa0]">/{service.unit === 'per_hour' || service.unit === 'hr' ? 'hr' : 'job'} (Fixed Capped)</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-xs p-4 rounded-2xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Selection */}
          <div>
            <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Service Address</label>
            <div className="flex gap-2 mb-3">
              {savedAddresses.map((sa) => (
                <button
                  type="button"
                  key={sa.label}
                  onClick={() => { setAddress(sa.address_text); setLat(sa.lat); setLng(sa.lng); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    address === sa.address_text
                      ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#c0c1ff]'
                      : 'bg-[#0f131e] border-white/[0.08] text-[#908fa0] hover:text-white'
                  }`}
                >
                  📍 {sa.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#8083ff] focus:ring-2 focus:ring-[#8083ff]/20 text-sm"
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#8083ff] text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-3.5" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#8083ff] text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Notes / Specific Instructions (Optional)</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#908fa0] absolute left-3.5 top-3.5" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bring extra tools, fan issue in master bedroom"
                rows="3"
                className="w-full pl-10 pr-4 py-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#8083ff] text-sm"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-[#1b1f2b] rounded-2xl p-4 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Fair-Match Guarantee Active</span>
                <p className="text-[11px] text-[#908fa0]">Job offered within 5.0km radius to top qualified member based on distance, rating & fair turn.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/25 transition cursor-pointer text-sm disabled:opacity-50"
          >
            {loading ? 'Submitting Request...' : `Confirm & Request Service (₹${service.base_price})`}
          </button>
        </form>
      </div>
    </div>
  );
}
