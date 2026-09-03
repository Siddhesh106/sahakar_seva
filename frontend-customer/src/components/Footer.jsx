import React from 'react';
import { Landmark } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0e19] border-t border-white/[0.08] text-[#908fa0] pt-8 pb-10 mt-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#171b27] border border-white/[0.08] flex items-center justify-center text-[#c0c1ff]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">SahakarSeva Cooperative Society Ltd.</h4>
              <p className="text-[11px] text-[#908fa0]">
                Registered under Multi-State Co-operative Societies Act • Pune Cluster Zone 04
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="bg-[#1b1f2b] border border-white/[0.08] text-[#c0c1ff] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]"></span>
              <span>8.5% CAPPED FEE</span>
            </div>
            <div className="bg-[#4edea3] text-[#003824] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003824]"></span>
              <span>91.5% WORKER PAYOUT</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-[#6c6b7c]">
          <p>© 2025 SahakarSeva Democratic Platform. Algorithmic transparency guaranteed by open consensus ledger.</p>
          <div className="flex items-center gap-4">
            <span>HASH: #PUN-COOP-88219</span>
            <span className="flex items-center gap-1.5 text-[#4edea3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              NODE ONLINE
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
