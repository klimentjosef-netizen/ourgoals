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
          <span className="text-[10px] text-white/40 font-mono">9:41</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-4" />

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Greeting — delay 0 */}
          <p
            className="text-white/90 text-sm font-semibold"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s",
            }}
          >
            Dobré ráno, Josef!
          </p>

          {/* Level + Streak cards — delay 1 */}
          <div
            className="grid grid-cols-2 gap-2"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease-out 0.55s, transform 0.6s ease-out 0.55s",
            }}
          >
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <span className="text-[10px] text-white/50 block mb-1">
                Level
              </span>
              <span className="text-white font-bold text-sm">Lv. 12</span>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{
                    width: mounted ? "65%" : "0%",
                    transition: "width 1s ease-out 1.2s",
                  }}
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

          {/* Checklist — delay 2 */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease-out 0.8s, transform 0.6s ease-out 0.8s",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-xs font-medium">
                Dnešní úkoly
              </span>
              <span className="text-white/40 text-[10px] font-mono">3/5</span>
            </div>
            <div className="space-y-1.5">
              {[
                { done: true, label: "Ranní check-in", delay: "1.0s" },
                { done: true, label: "Trénink — Pull day", delay: "1.15s" },
                { done: true, label: "Meditace 10 min", delay: "1.3s" },
                { done: false, label: "Zalogovat jídla", delay: "1.45s" },
                { done: false, label: "Večerní check-in", delay: "1.6s" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-xs"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.5s ease-out ${item.delay}, transform 0.5s ease-out ${item.delay}`,
                  }}
                >
                  <span className={item.done ? "text-green-400" : "text-white/20"}>
                    {item.done ? "✅" : "⬜"}
                  </span>
                  <span className={item.done ? "text-white/70" : "text-white/40"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Macro bar — delay 3 */}
          <div
            className="rounded-xl bg-white/5 border border-white/10 p-3"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease-out 1.8s, transform 0.6s ease-out 1.8s",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50">Proteiny</span>
              <span className="text-[10px] text-white/40 font-mono">
                145 / 200g
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                style={{
                  width: mounted ? "72%" : "0%",
                  transition: "width 1s ease-out 2.2s",
                }}
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
