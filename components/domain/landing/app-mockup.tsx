"use client";

import { useEffect, useState } from "react";

/* ================================================
   Realistic iPhone 15 Pro Mockup
   ================================================ */
export function AppMockup() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`mt-16 md:mt-20 flex justify-center transition-all duration-1000 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* Outer glow */}
      <div className="relative">
        {/* Shadow / glow */}
        <div className="absolute -inset-8 bg-primary/8 rounded-[80px] blur-3xl pointer-events-none" />
        <div className="absolute -inset-4 bg-coral/5 rounded-[70px] blur-2xl pointer-events-none" />

        {/* Phone frame */}
        <div
          className="relative w-[280px] md:w-[310px]"
          style={{
            aspectRatio: "9 / 19.5",
            transform: "perspective(1200px) rotateY(-4deg) rotateX(2deg)",
          }}
        >
          {/* Titanium edge */}
          <div className="absolute -inset-[3px] rounded-[56px] md:rounded-[60px] bg-gradient-to-b from-white/20 via-white/8 to-white/15" />

          {/* Phone body */}
          <div className="relative w-full h-full rounded-[54px] md:rounded-[58px] bg-[#0a0a12] overflow-hidden border border-white/[0.06]">

            {/* === Dynamic Island === */}
            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-20">
              <div className="w-[100px] h-[30px] bg-black rounded-full flex items-center justify-center gap-2">
                {/* Camera */}
                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a2e] border border-white/[0.06]">
                  <div className="w-[4px] h-[4px] rounded-full bg-[#2a2a4a] mt-[2.5px] ml-[2.5px]" />
                </div>
              </div>
            </div>

            {/* === Status bar === */}
            <div className="relative z-10 flex items-center justify-between px-7 pt-[14px] pb-1">
              <span className="text-[11px] text-white/70 font-semibold tracking-tight" style={{ fontFamily: "system-ui" }}>
                9:41
              </span>
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <rect x="0" y="7" width="3" height="4" rx="0.5" fill="white" fillOpacity="0.7" />
                  <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="white" fillOpacity="0.7" />
                  <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="white" fillOpacity="0.7" />
                  <rect x="13" y="0" width="3" height="11" rx="0.5" fill="white" fillOpacity="0.3" />
                </svg>
                {/* WiFi */}
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M 7 10 L 5.5 7.5 Q 7 6.5 8.5 7.5 Z" fill="white" fillOpacity="0.7" />
                  <path d="M 3.5 5.5 Q 7 2.5 10.5 5.5" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M 1.5 3.5 Q 7 -0.5 12.5 3.5" stroke="white" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
                {/* Battery */}
                <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
                  <rect x="0.5" y="0.5" width="20" height="10" rx="2" stroke="white" strokeOpacity="0.4" />
                  <rect x="21" y="3" width="2" height="5" rx="1" fill="white" fillOpacity="0.3" />
                  <rect x="1.5" y="1.5" width="16" height="8" rx="1.2" fill="white" fillOpacity="0.7" />
                </svg>
              </div>
            </div>

            {/* === Screen content === */}
            <div className="px-5 pt-2 pb-6 space-y-3.5">
              {/* Greeting + Buddy */}
              <div
                className="flex items-center justify-between"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.6s ease-out 0.4s, transform 0.6s ease-out 0.4s",
                }}
              >
                <div>
                  <p className="text-white/50 text-[10px]">Dobré ráno</p>
                  <p className="text-white/95 text-sm font-bold">Josefe!</p>
                </div>
                {/* Tiny Buddy face */}
                <div className="w-[36px] h-[36px]">
                  <svg viewBox="0 0 36 36" width="36" height="36" fill="none">
                    <circle cx="18" cy="18" r="14" fill="oklch(0.75 0.15 270)" />
                    <path d="M 10 13 L 7 5 L 14 11 Z" fill="oklch(0.72 0.13 270)" />
                    <path d="M 26 13 L 29 5 L 22 11 Z" fill="oklch(0.72 0.13 270)" />
                    <ellipse cx="14" cy="17" rx="2.2" ry="2.2" fill="white" />
                    <ellipse cx="22" cy="17" rx="2.2" ry="2.2" fill="white" />
                    <circle cx="13.8" cy="16.8" r="1" fill="#1a1625" />
                    <circle cx="21.8" cy="16.8" r="1" fill="#1a1625" />
                    <path d="M 14 22 Q 18 26 22 22" stroke="#1a1625" strokeWidth="1" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              </div>

              {/* Level + Streak cards */}
              <div
                className="grid grid-cols-2 gap-2"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.6s ease-out 0.65s, transform 0.6s ease-out 0.65s",
                }}
              >
                <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-3">
                  <span className="text-[9px] text-white/40 block mb-0.5 uppercase tracking-wider">Level</span>
                  <span className="text-white font-bold text-sm">Lv. 12</span>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[oklch(0.65_0.2_270)] to-[oklch(0.7_0.18_300)]"
                      style={{
                        width: mounted ? "65%" : "0%",
                        transition: "width 1.2s ease-out 1.4s",
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-3">
                  <span className="text-[9px] text-white/40 block mb-0.5 uppercase tracking-wider">Streak</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                      <path d="M 7 0 Q 12 5 12 9 Q 12 14 7 16 Q 2 14 2 9 Q 2 5 7 0 Z" fill="oklch(0.7 0.18 30)" />
                      <path d="M 7 6 Q 9 8 9 10 Q 9 13 7 14 Q 5 13 5 10 Q 5 8 7 6 Z" fill="oklch(0.78 0.14 85)" opacity="0.7" />
                    </svg>
                    <span className="text-white font-bold text-sm">47 dní</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.6s ease-out 0.9s, transform 0.6s ease-out 0.9s",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Dnešní úkoly</span>
                  <span className="text-[10px] text-white/30 font-mono">3/5</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { done: true, label: "Ranní check-in", delay: "1.1s" },
                    { done: true, label: "Trénink: Pull day", delay: "1.25s" },
                    { done: true, label: "Meditace 10 min", delay: "1.4s" },
                    { done: false, label: "Zalogovat jídla", delay: "1.55s" },
                    { done: false, label: "Večerní check-in", delay: "1.7s" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 text-[11px]"
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateX(0)" : "translateX(-8px)",
                        transition: `opacity 0.5s ease-out ${item.delay}, transform 0.5s ease-out ${item.delay}`,
                      }}
                    >
                      {item.done ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6.5" fill="oklch(0.65 0.2 270)" fillOpacity="0.2" stroke="oklch(0.65 0.2 270)" strokeWidth="0.8" />
                          <path d="M 4 7 L 6 9 L 10 5" stroke="oklch(0.65 0.2 270)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6.5" stroke="white" strokeOpacity="0.15" strokeWidth="0.8" />
                        </svg>
                      )}
                      <span className={item.done ? "text-white/70 line-through decoration-white/20" : "text-white/40"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macro bar */}
              <div
                className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-3"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.6s ease-out 1.9s, transform 0.6s ease-out 1.9s",
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">Proteiny</span>
                  <span className="text-[9px] text-white/30 font-mono">145 / 200g</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[oklch(0.68_0.12_200)] to-[oklch(0.72_0.14_180)]"
                    style={{
                      width: mounted ? "72%" : "0%",
                      transition: "width 1s ease-out 2.3s",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* === Home indicator === */}
            <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] rounded-full bg-white/20" />
          </div>

          {/* Side button (right) */}
          <div className="absolute right-[-3px] top-[100px] w-[3px] h-[40px] bg-gradient-to-b from-white/15 via-white/10 to-white/15 rounded-r-sm" />
          {/* Volume buttons (left) */}
          <div className="absolute left-[-3px] top-[80px] w-[3px] h-[24px] bg-gradient-to-b from-white/15 via-white/10 to-white/15 rounded-l-sm" />
          <div className="absolute left-[-3px] top-[110px] w-[3px] h-[24px] bg-gradient-to-b from-white/15 via-white/10 to-white/15 rounded-l-sm" />
          {/* Action button (left, small) */}
          <div className="absolute left-[-3px] top-[55px] w-[3px] h-[14px] bg-gradient-to-b from-white/15 via-white/10 to-white/15 rounded-l-sm" />
        </div>
      </div>
    </div>
  );
}
