import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Wrench, Zap, Sparkles, GraduationCap, Heart, Utensils, Flower2, PartyPopper, ChevronRight, ShieldCheck, Clock, Users } from 'lucide-react';

const ICON_MAP = {
  '🧹': Sparkles,
  '🔧': Wrench,
  '⚡': Zap,
  '📚': GraduationCap,
  '👴': Heart,
  '🍳': Utensils,
  '🌿': Flower2,
  '🎪': PartyPopper,
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Categories can be fetched or we use defaults from seed
    setCategories([
      { id: 'cat_cleaning', name: 'cleaning', base_price: 300, unit: 'per_job', icon: '🧹', title: 'Home Cleaning', desc: 'Deep cleaning, dusting & mopping' },
      { id: 'cat_plumbing', name: 'plumbing', base_price: 400, unit: 'per_job', icon: '🔧', title: 'Plumbing Repair', desc: 'Tap, pipe leakage & fittings' },
      { id: 'cat_electrical', name: 'electrical', base_price: 350, unit: 'per_job', icon: '⚡', title: 'Electrical Works', desc: 'Fan, switchboard, wiring repairs' },
      { id: 'cat_tutoring', name: 'tutoring', base_price: 500, unit: 'per_hour', icon: '📚', title: 'Home Tutoring', desc: 'K-12 math, science & language tutors' },
      { id: 'cat_elder_care', name: 'elder_care', base_price: 450, unit: 'per_hour', icon: '👴', title: 'Elder Care', desc: 'Compassionate home assistance' },
      { id: 'cat_cooking', name: 'cooking', base_price: 350, unit: 'per_job', icon: '🍳', title: 'Home Cook', desc: 'Fresh home-cooked meals' },
      { id: 'cat_gardening', name: 'gardening', base_price: 250, unit: 'per_job', icon: '🌿', title: 'Gardening & Plants', desc: 'Pruning, lawn care & watering' },
      { id: 'cat_event_help', name: 'event_help', base_price: 600, unit: 'per_job', icon: '🎪', title: 'Event Helper', desc: 'Catering support & party setup' },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-block bg-indigo-500/40 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Fair Match Guaranteed
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Cooperative Household Services</h1>
          <p className="text-indigo-100 mt-2 max-w-xl text-sm leading-relaxed">
            Directly connect with verified cooperative members near you. 100% transparent pricing and guaranteed profit-sharing for gig workers.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm text-center min-w-[220px]">
          <div>
            <span className="text-2xl font-bold">100%</span>
            <p className="text-xs text-indigo-200">Verified Workers</p>
          </div>
          <div>
            <span className="text-2xl font-bold">0%</span>
            <p className="text-xs text-indigo-200">Corporate Cut</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Select a Service
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Sparkles;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/book/${cat.name}`)}
                  className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Starts at</span>
                      <p className="text-base font-bold text-slate-800">₹{cat.base_price} <span className="text-xs font-normal text-slate-400">/{cat.unit === 'per_hour' ? 'hr' : 'job'}</span></p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Guarantee Section */}
      <div className="bg-slate-100/80 rounded-xl p-6 border border-slate-200 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">Rapid Matching</h4>
          <p className="text-xs text-slate-500 mt-1">Matched with nearby cooperative members within 90 seconds</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">KYC Verified Members</h4>
          <p className="text-xs text-slate-500 mt-1">Background checked and verified by local cooperative society</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">Fair Earnings Share</h4>
          <p className="text-xs text-slate-500 mt-1">91.5%+ of your payment goes directly into the worker's pocket</p>
        </div>
      </div>
    </div>
  );
}
