"use client";

import { useEffect, useState } from "react";

export function AppMockup() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`mt-12 md:mt-16 flex justify-center transition-all duration-1000 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div
        className="w-[280px] md:w-[320px] rounded-[2rem] border-2 border-white/10 bg-[#0d1117] shadow-2xl shadow-primary/10 overflow-hidden"
        style={{
          transform: "perspective(1000px) rotateY(-5deg)",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
          </div>
          <span className="text-[10px] text-white/40 font-mono">9:41 AM</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-4" />

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Greeting */}
          <p className="text-white/90 text-sm font-semibold">
            Dobré ráno, Josef!
          </p>

          {/* Level + Streak cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <span className="text-[10px] text-white/50 block mb-1">
                Level
              </span>
              <span className="text-white font-bold text-sm">Lv. 12</span>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <span className="text-[10px] text-white/50 block mb-1">
                Streak
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🔥</span>
                <span className="text-white font-bold text-sm">47 dní</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-xs font-medium">
                Dnešní úkoly
              </span>
              <span className="text-white/40 text-[10px] font-mono">3/5</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">✅</span>
                <span className="text-white/70">Ranní check-in</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">✅</span>
                <span className="text-white/70">Trénink — Pull day</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">✅</span>
                <span className="text-white/70">Meditace 10 min</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/20">⬜</span>
                <span className="text-white/40">Zalogovat jídla</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/20">⬜</span>
                <span className="text-white/40">Večerní check-in</span>
              </div>
            </div>
          </div>

          {/* Macro bar */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50">Proteiny</span>
              <span className="text-[10px] text-white/40 font-mono">
                145 / 200g
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                style={{ width: "72%" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom safe area */}
        <div className="h-4" />
      </div>
    </div>
  );
}
