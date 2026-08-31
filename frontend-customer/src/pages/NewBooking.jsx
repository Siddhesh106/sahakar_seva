import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { MapPin, Calendar, Clock, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

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
  const navigate = useNavigate();

  const service = CATEGORY_DATA[categoryName] || { name: categoryName, base_price: 350, unit: 'per_job' };

  const [address, setAddress] = useState('12 MG Road, Pune');
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
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
          category_id: `cat_${categoryName}`,
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">New Booking</span>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">{service.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-600">₹{service.base_price}</span>
            <p className="text-xs text-slate-400">/{service.unit === 'per_hour' ? 'hr' : 'job'}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Service Address</label>
            <div className="flex gap-2 mb-3">
              {savedAddresses.map((sa) => (
                <button
                  type="button"
                  key={sa.label}
                  onClick={() => { setAddress(sa.address_text); setLat(sa.lat); setLng(sa.lng); }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                    address === sa.address_text
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📍 {sa.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Date</label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Time</label>
              <div className="relative">
                <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Notes / Specific Instructions (Optional)</label>
            <div className="relative">
              <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bring extra tools, fan issue in master bedroom"
                rows="3"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-semibold text-slate-700">Fair-Match Guarantee</span>
                <p className="text-xs text-slate-500">Your job will be matched to the top nearby member based on distance, rating & fair turn.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-lg shadow-md transition disabled:opacity-50 text-base"
          >
            {loading ? 'Submitting Request...' : `Confirm & Request Service (₹${service.base_price})`}
          </button>
        </form>
      </div>
    </div>
  );
}
