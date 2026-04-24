"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ================================================
   StickyHeader
   ================================================ */
export function StickyHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-heading text-lg font-bold tracking-tight">
            <span className="text-primary">Our</span>Goals
          </span>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Začít zdarma
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ================================================
   SmoothScrollLink
   ================================================ */
export function SmoothScrollLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

/* ================================================
   useInView — reusable IntersectionObserver hook
   ================================================ */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ================================================
   AnimatedCounter
   Counts from 0 to `target` when in viewport.
   ================================================ */
export function AnimatedCounter({
  target,
  duration = 1500,
  className,
  suffix = "",
}: {
  target: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const { ref, inView } = useInView(0.5);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString("cs-CZ")}
      {suffix}
    </span>
  );
}

/* ================================================
   AnimatedProgress
   Progress bar fills from 0 to `value`% on scroll.
   ================================================ */
export function AnimatedProgress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const { ref, inView } = useInView(0.5);

  return (
    <div ref={ref} className={`h-3 rounded-full bg-muted overflow-hidden ${className ?? ""}`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${
          barClassName ?? "bg-gradient-to-r from-primary to-primary/70"
        }`}
        style={{ width: inView ? `${value}%` : "0%" }}
      />
    </div>
  );
}

/* ================================================
   CoachToneDemo
   5 clickable pills — shows example quote for tone.
   ================================================ */
const coachTones: { label: string; quote: string }[] = [
  {
    label: "Přísný",
    quote: "Žádné výmluvy. Dnes máš 3 nesplněné úkoly. Jdi na to.",
  },
  {
    label: "Kamarádský",
    quote: "Hej, zbývají ti 2 úkoly — dáš to! 💪",
  },
  {
    label: "Klidný",
    quote: "Dnes je dobrý den. Udělej, co můžeš. Zbytek počká.",
  },
  {
    label: "Energický",
    quote: "LEVEL UP blízko! Ještě 200 XP a jsi tam! LET'S GO! 🔥",
  },
  {
    label: "Minimální",
    quote: "3 úkoly zbývají.",
  },
];

export function CoachToneDemo() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 max-w-md">
      <p className="text-sm text-muted-foreground mb-3">Vyber si tón kouče:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {coachTones.map((tone, i) => (
          <button
            key={tone.label}
            onClick={() => setSelected(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              selected === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {tone.label}
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-muted/50 border border-border/50 p-3 min-h-[3rem]">
        <p className="text-sm text-foreground italic">
          &ldquo;{coachTones[selected].quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
