import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import {
  Wrench,
  Zap,
  Sparkles,
  GraduationCap,
  Heart,
  Utensils,
  Flower2,
  PartyPopper,
  ShieldCheck,
  Clock,
  Users,
  ArrowRight,
  X
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'cleaning',
    name: 'cleaning',
    title: 'Home Cleaning',
    desc: 'Deep cleaning, dusting & mopping',
    base_price: 300,
    unit: 'job',
    icon: Sparkles,
    tileBg: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'plumbing',
    name: 'plumbing',
    title: 'Plumbing Repair',
    desc: 'Tap, pipe leakage & fittings',
    base_price: 400,
    unit: 'job',
    icon: Wrench,
    tileBg: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'electrical',
    name: 'electrical',
    title: 'Electrical Works',
    desc: 'Fan, switchboard, wiring repairs',
    base_price: 350,
    unit: 'job',
    icon: Zap,
    tileBg: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'tutoring',
    name: 'tutoring',
    title: 'Home Tutoring',
    desc: 'K-12 math, science & language...',
    base_price: 500,
    unit: 'hr',
    icon: GraduationCap,
    tileBg: 'bg-teal-50 text-teal-600',
  },
  {
    id: 'elder_care',
    name: 'elder_care',
    title: 'Elder Care',
    desc: 'Compassionate home assistance',
    base_price: 450,
    unit: 'hr',
    icon: Heart,
    tileBg: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'cooking',
    name: 'cooking',
    title: 'Home Cook',
    desc: 'Fresh home-cooked meals',
    base_price: 350,
    unit: 'job',
    icon: Utensils,
    tileBg: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'gardening',
    name: 'gardening',
    title: 'Gardening & Plants',
    desc: 'Pruning, lawn care & watering',
    base_price: 250,
    unit: 'job',
    icon: Flower2,
    tileBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'event_help',
    name: 'event_help',
    title: 'Event Helper',
    desc: 'Catering support & party setup',
    base_price: 600,
    unit: 'job',
    icon: PartyPopper,
    tileBg: 'bg-fuchsia-50 text-fuchsia-600',
  },
];

export default function Home() {
  const [promptText, setPromptText] = useState('');
  const [matchingAi, setMatchingAi] = useState(false);
  const navigate = useNavigate();

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setMatchingAi(true);
    try {
      const res = await apiFetch('/ai/parse-request', {
        method: 'POST',
        body: JSON.stringify({ text: promptText.trim() }),
      });
      if (res.parsed?.category) {
        navigate(`/book/${res.parsed.category}?notes=${encodeURIComponent(promptText)}&urgency=${res.parsed.urgency || 'medium'}`);
      } else {
        navigate(`/book/electrical?notes=${encodeURIComponent(promptText)}`);
      }
    } catch (err) {
      console.error('AI match error:', err);
      navigate(`/book/electrical?notes=${encodeURIComponent(promptText)}`);
    } finally {
      setMatchingAi(false);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181336] via-[#12183e] to-[#0f1322] border border-white/[0.1] p-8 sm:p-10 shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8083ff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pune Cooperative Network Active
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-tight">
              Fair–Matched Household Services
            </h1>

            <p className="text-sm sm:text-base text-[#c7c4d7] leading-relaxed max-w-xl">
              Connect directly with verified cooperative members in your neighborhood. Fixed transparent rates, zero algorithmic exploitation, and guaranteed profit-sharing.
            </p>
          </div>

          {/* Dual-Metric Pill */}
          <div className="bg-[#0a0e19]/90 border border-white/[0.12] rounded-2xl p-5 sm:p-6 backdrop-blur-md flex items-center gap-6 text-center shadow-xl shrink-0">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">8.5%</span>
              <p className="text-[10px] text-[#c0c1ff] font-bold uppercase tracking-widest">Capped Fee</p>
            </div>
            <div className="w-px h-12 bg-white/[0.1]"></div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#4edea3] tracking-tight">91.5%</span>
              <p className="text-[10px] text-[#4edea3] font-bold uppercase tracking-widest">Worker Payout</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. AI PROBLEM ASSISTANT */}
      <div className="bg-[#171b27]/90 border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1b1f2b] border border-white/[0.1] text-[#c0c1ff] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#c0c1ff]" />
          </div>
          <h3 className="font-extrabold text-white text-base">AI Problem Assistant</h3>
          <span className="bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Natural Language
          </span>
        </div>

        <p className="text-xs text-[#908fa0]">
          Describe the problem in your own words in English or Hindi (e.g., <em>"bedroom fan stopped working need electrician"</em> or <em>"kitchen pipe leak"</em>)
        </p>

        <form onSubmit={handleAiSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Type your household problem here..."
              className="w-full pl-4 pr-10 py-3.5 bg-[#0f131e] border border-white/[0.08] rounded-xl text-sm text-white placeholder-[#6c6b7c] focus:outline-none focus:border-[#8083ff] focus:ring-2 focus:ring-[#8083ff]/20 transition"
            />
            {promptText && (
              <button
                type="button"
                onClick={() => setPromptText('')}
                className="absolute right-3.5 top-3.5 text-[#908fa0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={matchingAi}
            className="bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{matchingAi ? 'Matching...' : 'Match Service'}</span>
          </button>
        </form>
      </div>

      {/* 3. SELECT A SERVICE */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#c0c1ff]" />
            <span>Select a Service</span>
          </h2>
          <span className="text-[10px] font-mono tracking-widest text-[#908fa0] uppercase">
            Fixed Pune District Schedule
          </span>
        </div>

        {/* 8 White Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/book/${cat.name}`)}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${cat.tileBg} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Starts at</span>
                    <p className="text-lg font-extrabold text-slate-900">
                      ₹{cat.base_price} <span className="text-xs font-normal text-slate-400">/{cat.unit}</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-[#6366f1] group-hover:text-white transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TRUST & GUARANTEE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Rapid Matching</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Matched with nearby cooperative members within 90 seconds
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 border-t md:border-t-0 md:border-l md:border-r border-slate-100 pt-6 md:pt-0">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">KYC Verified Members</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Background checked and verified by local cooperative society
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 border-t md:border-t-0 border-slate-100 pt-6 md:pt-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Fair Earnings Share</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            91.5%+ of your payment goes directly into the worker's pocket
          </p>
        </div>
      </div>

    </div>
  );
}

