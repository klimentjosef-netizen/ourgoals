"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ================================================
   FadeInSection — IntersectionObserver wrapper
   ================================================ */
export function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* ================================================
   StickyHeader — cream/white bg blur, gold CTA
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
      <div className="bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-heading text-lg font-bold tracking-tight">
            <span className="text-primary">Our</span>Goals
          </span>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-5 h-9 text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-[#C8A84E]/20"
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
   PulseGlowButton — Gold glow CTA button
   ================================================ */
export function PulseGlowButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-[#C8A84E]/25 hover:shadow-xl hover:shadow-[#C8A84E]/40 hover:scale-[1.03] ${className}`}
    >
      {/* Animated gold glow ring */}
      <span className="absolute inset-0 rounded-xl animate-pulse-glow pointer-events-none" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(200, 168, 78, 0.4);
          }
          50% {
            box-shadow: 0 0 20px 4px rgba(200, 168, 78, 0.15);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
      `}</style>
    </Link>
  );
}

/* ================================================
   FloatingParticles — gold and cream dots only
   ================================================ */
export function FloatingParticles({ count = 30 }: { count?: number }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.05,
    }));
    setParticles(generated);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            background: p.id % 2 === 0
              ? "#C8A84E"
              : "#F5F0E8",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes particle-drift {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--tw-opacity, 0.15);
          }
          90% {
            opacity: var(--tw-opacity, 0.15);
          }
          100% {
            transform: translateY(-80px) translateX(20px);
            opacity: 0;
          }
        }
        .animate-particle {
          animation: particle-drift linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ================================================
   CoachToneDemo — navy bg pills, gold active state
   ================================================ */
const coachTones: { id: string; label: string; emoji: string; quote: string }[] = [
  {
    id: "strict",
    label: "Přísný",
    emoji: "🎖️",
    quote: "Žádné výmluvy. Dnes máš 3 nesplněné úkoly a streak ti visí na vlásku. Vstávej a jdi na to. Teď.",
  },
  {
    id: "friendly",
    label: "Kamarádský",
    emoji: "😊",
    quote: "Hej, zbývají ti jen 2 úkoly a den ještě nekončí! Věřím, že to dáš. Pojď, ať máš večer klid.",
  },
  {
    id: "calm",
    label: "Klidný",
    emoji: "🧘",
    quote: "Dnes je dobrý den. Udělej, co zvládneš — i malý krok je pokrok. Zbytek klidně počká na zítřek.",
  },
  {
    id: "energetic",
    label: "Energický",
    emoji: "🔥",
    quote: "LEVEL UP na dosah! Ještě 200 XP a jsi Level 13! Dva úkoly a máš to! LET'S GOOO!",
  },
  {
    id: "minimal",
    label: "Minimální",
    emoji: "📝",
    quote: "3 úkoly zbývají. Streak: 47 dní.",
  },
];

export function CoachToneDemo() {
  const [selected, setSelected] = useState(1); // default to "friendly"

  return (
    <div className="max-w-lg">
      <h3 className="font-heading text-xl md:text-2xl font-semibold mb-2">
        Tvůj AI kouč. Tvůj styl.
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Vyber si tón, jakým ti kouč píše. Můžeš ho kdykoliv změnit.
      </p>

      {/* Tone buttons — navy pills, gold active */}
      <div className="flex flex-wrap gap-2 mb-5">
        {coachTones.map((tone, i) => (
          <button
            key={tone.id}
            onClick={() => setSelected(i)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              selected === i
                ? "bg-primary text-primary-foreground shadow-md shadow-[#C8A84E]/25 scale-105"
                : "bg-[#0B1120] text-[#F5F0E8]/80 hover:bg-[#131B2E] hover:scale-[1.02]"
            }`}
          >
            <span>{tone.emoji}</span>
            {tone.label}
          </button>
        ))}
      </div>

      {/* Chat bubble notification */}
      <div className="relative">
        {/* Arrow */}
        <div className="absolute -top-2 left-8 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
        {/* Bubble */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 size-9 rounded-full bg-primary/15 flex items-center justify-center text-lg">
              {coachTones[selected].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold">OurGoals Kouč</span>
                <span className="text-[10px] text-muted-foreground">právě teď</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {coachTones[selected].quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
