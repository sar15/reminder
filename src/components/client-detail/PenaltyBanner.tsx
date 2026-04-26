"use client";

import { TrendingDown } from "lucide-react";

export function PenaltyBanner({ amount }: { amount: number }) {
  if (amount <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#fff1f2] to-white border border-[#fecdd3] rounded-2xl p-4 mb-6 flex items-center justify-between relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e11d48]" />
      
      <div className="flex items-center gap-4 pl-2">
        <div className="w-10 h-10 rounded-full bg-[#fecdd3] text-[#e11d48] flex items-center justify-center shrink-0">
          <TrendingDown size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#9f1239]">Penalty Exposure</h3>
          <p className="text-xs text-[#be123c] mt-0.5">Estimated late fees accruing daily based on overdue tasks</p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold text-[#e11d48]">₹{amount.toLocaleString("en-IN")}</div>
      </div>
    </div>
  );
}
