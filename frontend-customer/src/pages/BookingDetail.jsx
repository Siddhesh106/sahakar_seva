import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Loader2, CheckCircle2, Phone, Star, ShieldCheck, CreditCard, ArrowLeft, AlertCircle } from 'lucide-react';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Rating form state
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Payment state
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await apiFetch(`/bookings/${id}`);
      setBooking(res.booking);
      if (res.booking?.payment?.status === 'success') {
        setPaymentDone(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Poll every 3 seconds while matching or in progress
    const interval = setInterval(() => {
      fetchBooking();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handlePay = async () => {
    setInitiatingPayment(true);
    try {
      // Step 1: Initiate payment intent
      await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ booking_id: id }),
      });

      // Step 2: Trigger mock webhook callback to mark success
      await apiFetch('/payments/webhook', {
        method: 'POST',
        body: JSON.stringify({ booking_id: id, status: 'success' }),
      });

      setPaymentDone(true);
      fetchBooking();
    } catch (err) {
      alert(err.message);
    } finally {
      setInitiatingPayment(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!booking?.assigned_worker_id) return;
    setSubmittingRating(true);

    try {
      await apiFetch('/ratings', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: id,
          to_user_id: booking.assigned_worker_id,
          stars,
          comment,
        }),
      });
      setRatingSubmitted(true);
      fetchBooking();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Booking not found'}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-xs font-semibold underline">Return Home</button>
      </div>
    );
  }

  const { status, category, assigned_worker, price, address_text } = booking;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> All Bookings
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Booking #{booking.id.slice(0, 8)}</span>
            <h1 className="text-xl font-bold mt-0.5">{category?.name?.toUpperCase() || 'Service'}</h1>
            <p className="text-xs text-slate-400 mt-1">📍 {address_text}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'matching' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              status === 'assigned' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              status === 'in_progress' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
              status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              'bg-slate-700 text-slate-300'
            }`}>
              {status.replace('_', ' ')}
            </span>
            <p className="text-lg font-bold mt-2">₹{price}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['requested', 'matching', 'assigned', 'in_progress', 'completed'].map((step, idx) => {
              const currentIdx = ['requested', 'matching', 'assigned', 'in_progress', 'completed'].indexOf(status);
              const isPassed = currentIdx >= idx;
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isPassed ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 mt-1.5 capitalize">
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content based on Status */}
        <div className="p-8">
          {/* Status: MATCHING */}
          {status === 'matching' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Finding a verified cooperative member near you...</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Our Fair-Match engine is offering this job to the top qualified worker based on proximity, rating, and fairness scoring.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full font-medium">
                <ShieldCheck className="w-4 h-4" /> Live polling every 3 seconds
              </div>
            </div>
          )}

          {/* Status: ASSIGNED or IN_PROGRESS */}
          {(status === 'assigned' || status === 'in_progress') && assigned_worker && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow">
                    {assigned_worker.name?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <span className="text-xs text-indigo-600 font-semibold uppercase">Assigned Member</span>
                    <h3 className="text-lg font-bold text-slate-800">{assigned_worker.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {assigned_worker.worker_profile?.rating_avg || '5.0'}
                      </span>
                      <span>• {assigned_worker.worker_profile?.total_jobs_completed || 0} jobs completed</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${assigned_worker.phone}`}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
                >
                  <Phone className="w-4 h-4" /> Call Worker
                </a>
              </div>

              <div className="bg-purple-50 text-purple-700 p-4 rounded-xl text-sm border border-purple-100 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
                <span>
                  {status === 'assigned' ? 'Worker is on their way to your address.' : 'Worker is currently performing the service.'}
                </span>
              </div>
            </div>
          )}

          {/* Status: COMPLETED */}
          {status === 'completed' && (
            <div className="space-y-8">
              {/* Payment Section */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Details
                </h3>

                <div className="space-y-2 text-sm text-slate-600 border-b border-slate-200 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Base Service Price</span>
                    <span className="font-semibold">₹{price}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Cooperative Society Platform Fee (8.5%)</span>
                    <span>₹{(price * 0.085).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Direct Worker Payout</span>
                    <span>₹{(price * 0.915).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Amount Payable</span>
                    <p className="text-xl font-bold text-slate-800">₹{price}</p>
                  </div>

                  {paymentDone || booking.payment?.status === 'success' ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5" /> Paid via UPI
                    </div>
                  ) : (
                    <button
                      onClick={handlePay}
                      disabled={initiatingPayment}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-md transition disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                      {initiatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now via UPI (₹' + price + ')'}
                    </button>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Rate & Review Member
                </h3>

                {ratingSubmitted ? (
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Thank you! Your feedback has been submitted to the cooperative.
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setStars(s)}
                            className="p-2 transition"
                          >
                            <Star className={`w-7 h-7 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Comment (Optional)</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a few words about the service..."
                        rows="2"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingRating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg text-sm shadow transition disabled:opacity-50"
                    >
                      {submittingRating ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
