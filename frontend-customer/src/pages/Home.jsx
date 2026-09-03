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
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl mb-8 border border-indigo-700/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-400/20 uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Pune Cooperative Network Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Fair-Matched Household Services
            </h1>
            <p className="text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
              Connect directly with verified cooperative members in your neighborhood. Fixed transparent rates, zero algorithmic exploitation, and guaranteed profit-sharing.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center min-w-[240px] shadow-inner">
            <div className="p-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">8.5%</span>
              <p className="text-[11px] text-indigo-300 mt-1 uppercase font-medium tracking-wider">Capped Fee</p>
            </div>
            <div className="p-2 border-l border-white/10">
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">91.5%</span>
              <p className="text-[11px] text-emerald-300/80 mt-1 uppercase font-medium tracking-wider">Worker Payout</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Request Classification Bar */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-7 border border-indigo-100/80 shadow-lg shadow-indigo-950/5 mb-10 transition-all hover:border-indigo-300">
        <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-sm mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
          </div>
          <span className="text-slate-900 font-bold text-base">AI Problem Assistant</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-md border border-indigo-200/50">
            Natural Language
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4 pl-9">
          Describe the problem in your own words in English or Hindi (e.g., <em>"bedroom fan stopped working need electrician"</em> or <em>"kitchen pipe leak"</em>)
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const input = e.target.elements.prompt.value.trim();
            if (!input) return;
            try {
              const res = await apiFetch('/ai/parse-request', {
                method: 'POST',
                body: JSON.stringify({ text: input })
              });
              if (res.parsed?.category) {
                navigate(`/book/${res.parsed.category}?notes=${encodeURIComponent(input)}&urgency=${res.parsed.urgency}`);
              }
            } catch (err) {
              console.error('AI parse error:', err);
              navigate(`/book/electrical?notes=${encodeURIComponent(input)}`);
            }
          }}
          className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-9"
        >
          <div className="relative flex-1">
            <input
              name="prompt"
              type="text"
              placeholder="Type your household problem here..."
              className="w-full pl-4 pr-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold px-6 py-3.5 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Match Service
          </button>
        </form>
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
