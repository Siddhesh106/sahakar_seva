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
        <Loader2 className="w-10 h-10 text-[#8083ff] animate-spin mb-4" />
        <p className="text-[#908fa0] text-sm">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-red-950/40 text-red-300 rounded-2xl border border-red-800/60 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'Booking not found'}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-xs font-semibold underline cursor-pointer">Return Home</button>
      </div>
    );
  }

  const { status, category, assigned_worker, price, address_text } = booking;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#908fa0] hover:text-white transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> All Bookings
      </button>

      {/* Main Card */}
      <div className="bg-[#171b27]/90 rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-[#1b1f2b] p-6 sm:p-7 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#c0c1ff] font-bold uppercase tracking-wider block">Booking #{booking.id.slice(0, 8)}</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{category?.name?.toUpperCase() || 'SERVICE'}</h1>
            <p className="text-xs text-[#908fa0] mt-1 flex items-center gap-1">📍 {address_text}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'matching' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              status === 'assigned' ? 'bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30' :
              status === 'in_progress' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
              status === 'completed' ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30' :
              'bg-white/[0.06] text-[#908fa0] border border-white/[0.08]'
            }`}>
              {status.replace('_', ' ')}
            </span>
            <p className="text-xl font-extrabold text-white mt-2">₹{price}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="p-6 border-b border-white/[0.06] bg-[#121624]/60">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['requested', 'matching', 'assigned', 'in_progress', 'completed'].map((step, idx) => {
              const currentIdx = ['requested', 'matching', 'assigned', 'in_progress', 'completed'].indexOf(status);
              const isPassed = currentIdx >= idx;
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isPassed ? 'bg-gradient-to-r from-[#8083ff] to-[#6366f1] text-white shadow-md shadow-[#8083ff]/30' : 'bg-[#1b1f2b] text-[#908fa0] border border-white/[0.08]'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[#908fa0] mt-1.5 capitalize">
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content based on Status */}
        <div className="p-6 sm:p-8">
          {/* Status: MATCHING */}
          {status === 'matching' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mb-4 animate-pulse border border-amber-500/20">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-white">Finding a verified cooperative member near you...</h3>
              <p className="text-sm text-[#908fa0] mt-2 max-w-md mx-auto">
                Our Fair-Match engine is offering this job to the top qualified worker based on proximity, rating, and fairness scoring.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-[#c0c1ff] bg-[#8083ff]/10 border border-[#8083ff]/20 px-4 py-2 rounded-full font-medium">
                <ShieldCheck className="w-4 h-4" /> Live polling every 3 seconds
              </div>
            </div>
          )}

          {/* Status: ASSIGNED or IN_PROGRESS */}
          {(status === 'assigned' || status === 'in_progress') && assigned_worker && (
            <div className="space-y-6">
              <div className="bg-[#1b1f2b] p-6 rounded-2xl border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#6366f1] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                    {assigned_worker.name?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <span className="text-[11px] text-[#c0c1ff] font-bold uppercase tracking-wider">Assigned Member</span>
                    <h3 className="text-lg font-bold text-white">{assigned_worker.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#908fa0] mt-1">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {assigned_worker.worker_profile?.rating_avg || '5.0'}
                      </span>
                      <span>• {assigned_worker.worker_profile?.total_jobs_completed || 0} jobs completed</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${assigned_worker.phone}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4edea3] to-[#00a572] text-[#003824] font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-500/20"
                >
                  <Phone className="w-4 h-4" /> Call Worker
                </a>
              </div>

              <div className="bg-[#8083ff]/10 text-[#c0c1ff] p-4 rounded-2xl text-xs border border-[#8083ff]/20 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8083ff] animate-ping" />
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
              <div className="bg-[#1b1f2b] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#c0c1ff]" /> Payment Settlement (Consensus Cap)
                </h3>

                <div className="space-y-2 text-xs text-[#c7c4d7] border-b border-white/[0.08] pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Base Service Price</span>
                    <span className="font-bold text-white">₹{price}</span>
                  </div>
                  <div className="flex justify-between text-[#908fa0]">
                    <span>Cooperative Society Platform Fee (8.5%)</span>
                    <span>₹{(price * 0.085).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#4edea3] font-bold">
                    <span>Direct Worker Payout (91.5%)</span>
                    <span>₹{(price * 0.915).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#908fa0]">Total Amount Payable</span>
                    <p className="text-2xl font-extrabold text-white">₹{price}</p>
                  </div>

                  {paymentDone || booking.payment?.status === 'success' ? (
                    <div className="flex items-center gap-2 text-[#4edea3] bg-[#4edea3]/15 px-4 py-2.5 rounded-xl font-bold text-xs border border-[#4edea3]/30">
                      <CheckCircle2 className="w-4 h-4" /> Paid via UPI
                    </div>
                  ) : (
                    <button
                      onClick={handlePay}
                      disabled={initiatingPayment}
                      className="bg-gradient-to-r from-[#4edea3] to-[#00a572] text-[#003824] font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 text-xs flex items-center gap-2 cursor-pointer"
                    >
                      {initiatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now via UPI (₹' + price + ')'}
                    </button>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div className="bg-[#1b1f2b] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rate & Review Member
                </h3>

                {ratingSubmitted ? (
                  <div className="bg-[#4edea3]/15 text-[#4edea3] p-4 rounded-xl text-xs border border-[#4edea3]/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3]" /> Thank you! Your feedback has been recorded on the cooperative ledger.
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setStars(s)}
                            className="p-1 transition cursor-pointer"
                          >
                            <Star className={`w-6 h-6 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-[#464554]'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-2">Comment (Optional)</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a few words about the service..."
                        rows="2"
                        className="w-full p-3 bg-[#0f131e] border border-white/[0.08] rounded-xl text-xs text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#8083ff]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingRating}
                      className="bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-purple-600/20 transition disabled:opacity-50 cursor-pointer"
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
