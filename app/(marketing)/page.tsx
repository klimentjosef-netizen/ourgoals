import Link from "next/link";
import {
  Target,
  Layers,
  Flame,
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  Moon,
  Users,
  Briefcase,
  Trophy,
  Zap,
  Heart,
  ChevronRight,
  Quote,
} from "lucide-react";
import {
  StickyHeader,
  SmoothScrollLink,
  AnimatedCounter,
  AnimatedProgress,
  CoachToneDemo,
  FadeInSection,
  PulseGlowButton,
  FloatingParticles,
} from "@/components/domain/landing/landing-client";
import { AppMockup } from "@/components/domain/landing/app-mockup";
import { Goalie } from "@/components/domain/buddy/buddy";

/* ─── DATA ─── */

const personas = [
  {
    emoji: "🏋️",
    title: "Sportovci",
    story:
      "Chodíš do posilovny 3x týdně, ale nemáš systém. OurGoals ti řekne co dnes trénovat, navrhne váhy a sleduje tvůj progres. Žádné přemýšlení, jen výsledky.",
  },
  {
    emoji: "📊",
    title: "Produktivní lidé",
    story:
      "Máš milion úkolů a nulový přehled. OurGoals ti uspořádá den do bloků, hlídá tvůj focus time a ukazuje, kde reálně trávíš čas. Konec chaosu.",
  },
  {
    emoji: "❤️",
    title: "Páry a rodiny",
    story:
      "Sdílený kalendář, společné cíle, partnerské vzkazy. Konečně víte kdo co dělá, plánujete spolu a motivujete se navzájem. Žádné ‚já jsem ti to říkal'.",
  },
  {
    emoji: "🎯",
    title: "Kdokoliv s cílem",
    story:
      "Chceš zhubnout, naučit se jazyk, přestat kouřit... cokoliv. OurGoals ti rozloží velký cíl na denní kroky a hlídá, aby ses nevzdal. Tentokrát to dotáhneš.",
  },
];

const painPoints = [
  {
    text: "Pondělí: ‚Od zítřka cvičím.' Pátek: Netflix a čipsy.",
    emoji: "📅",
  },
  {
    text: "Máš 3 todo appky a 0 splněných úkolů.",
    emoji: "📱",
  },
  {
    text: "Začneš v lednu plný motivace. V únoru zase sedíš na gauči.",
    emoji: "🛋️",
  },
];

const benefits = [
  {
    icon: Target,
    title: "Vyber si co chceš řídit",
    desc: "Modulární systém. Aktivuj jen to, co potřebuješ. Zbytek tě neruší.",
  },
  {
    icon: Layers,
    title: "Všechno propojené",
    desc: "Cíle, trénink, jídlo, spánek, práce: vše na jednom místě, vše se doplňuje.",
  },
  {
    icon: Flame,
    title: "Gamifikace, která drží",
    desc: "XP, levely, streaky, achievementy. Ne jako hra, ale jako systém, který tě nepustí.",
  },
];

const steps = [
  {
    num: "01",
    title: "Vyber si moduly",
    desc: "Trénink? Jídlo? Kalendář? Práce? Aktivuj jen to, co právě řešíš.",
    visual: "modules",
  },
  {
    num: "02",
    title: "Nastav si cíle",
    desc: "Definuj co chceš dosáhnout. App ti vytvoří denní checklist na míru.",
    visual: "goal",
  },
  {
    num: "03",
    title: "Plň a sbírej XP",
    desc: "Každý den plníš úkoly, sbíráš body, rosteš v levelu. A streak tě nepustí.",
    visual: "xp",
  },
];

const modules = [
  {
    icon: Target,
    name: "Cíle & návyky",
    desc: "Jakékoliv cíle, denní checklist, streak tracking",
  },
  {
    icon: Moon,
    name: "Spánek & wellbeing",
    desc: "Spánek, nálada, energie, ranní a večerní rituál",
  },
  {
    icon: CalendarDays,
    name: "Kalendář & čas",
    desc: "Plánování dne, konflikty, rozvrh, eventy",
  },
  {
    icon: Briefcase,
    name: "Práce & focus",
    desc: "Deep work bloky, meetingy, produktivita",
  },
  {
    icon: Dumbbell,
    name: "Trénink & tělo",
    desc: "Plány, logování, progressive overload, metriky",
  },
  {
    icon: UtensilsCrossed,
    name: "Jídlo & výživa",
    desc: "Makra, kalorie, jídelní šablony, přehledy",
  },
  {
    icon: Users,
    name: "Rodina & partner",
    desc: "Sdílený kalendář, vzkazy, společné cíle",
  },
];

const testimonials = [
  {
    text: "Poprvé v životě držím návyky déle než měsíc. Ten streak je návykový, nechci přijít o 53 dní v řadě.",
  },
  {
    text: "Konečně nemusím přemýšlet co dělat. Otevřu app a vím. Trénink, jídlo, úkoly: všechno na jednom místě.",
  },
  {
    text: "Moje partnerka se přidala po týdnu. Teď plníme cíle spolu a motivujeme se navzájem. Nejlepší rozhodnutí.",
  },
];

/* ─── STEP VISUALS ─── */

function StepModulesVisual() {
  const icons = [Target, Dumbbell, UtensilsCrossed, CalendarDays, Moon, Briefcase];

  return (
    <div className="grid grid-cols-3 gap-1.5 mt-4 max-w-[120px]">
      {icons.map((Icon, i) => (
        <div
          key={i}
          className="size-9 rounded-lg flex items-center justify-center bg-primary/15 text-primary"
        >
          <Icon className="size-4" />
        </div>
      ))}
    </div>
  );
}

function StepGoalVisual() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-3 max-w-[200px]">
      <div className="text-xs font-medium mb-1.5">Zhubnout 5 kg</div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-3/5 rounded-full bg-primary" />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">60 %</div>
    </div>
  );
}

function StepXpVisual() {
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5">
        <Zap className="size-3.5 text-primary" />
        <span className="text-xs font-bold">+50 XP</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-coral/10 border border-coral/20 px-3 py-1.5">
        <Flame className="size-3.5 text-coral" />
        <span className="text-xs font-bold">12 dní</span>
      </div>
    </div>
  );
}

const stepVisuals: Record<string, React.ReactNode> = {
  modules: <StepModulesVisual />,
  goal: <StepGoalVisual />,
  xp: <StepXpVisual />,
};

/* ─── STORE BADGE (placeholder) ─── */

function StoreBadge({ store }: { store: "apple" | "google" }) {
  return (
    <div className="group relative inline-flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm px-5 py-3 hover:border-primary/20 hover:bg-card/60 transition-all duration-300 cursor-default">
      {store === "apple" ? (
        <svg className="size-6 text-foreground/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        <svg className="size-6 text-foreground/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.18 23.71c.36.21.81.21 1.17 0l11.54-6.67-2.56-2.56L3.18 23.71zM.54 1.23C.2 1.56 0 2.07 0 2.72v18.56c0 .65.2 1.16.54 1.49l.08.08L11.92 12l-.08-.08L.54 1.23zM22.36 10.37l-3.07-1.77-2.82 2.82 2.82 2.82 3.12-1.8c.89-.51.89-1.35-.05-2.07zM14.46 14.49l-2.54-2.54-11.38 11.38c.29.31.78.35 1.32.05l12.6-8.89z" />
        </svg>
      )}
      <div>
        <span className="text-[10px] text-muted-foreground block leading-none">
          {store === "apple" ? "Stáhnout na" : "Stáhnout z"}
        </span>
        <span className="text-sm font-semibold leading-tight text-foreground/80">
          {store === "apple" ? "App Store" : "Google Play"}
        </span>
      </div>
      {/* Coming soon tag — gold */}
      <span className="absolute -top-2 -right-2 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
        Brzy
      </span>
    </div>
  );
}

/* ─── PAGE ─── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <StickyHeader />

      {/* ======== 1. HERO — Cream bg ======== */}
      <section className="relative overflow-hidden bg-background">
        {/* Subtle warm glow — no rainbow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <FloatingParticles count={20} />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-8 md:pt-28 md:pb-14">
          {/* Logo */}
          <div className="mb-14 md:mb-20">
            <span className="font-heading text-xl font-bold tracking-tight">
              <span className="text-primary">Our</span>Goals
            </span>
          </div>

          {/* Hero content */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
            {/* Goalie — above on mobile, left on desktop */}
            <div className="flex-shrink-0 md:mt-4">
              <Goalie mood="waving" size={180} className="drop-shadow-2xl" />
            </div>

            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-foreground">
                Tvůj den.
                <br />
                Tvůj plán.
                <br />
                <span className="text-primary">
                  Tvůj Goalie.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed mx-auto md:mx-0">
                Jedna app na všechno. Cíle, návyky, trénink, jídlo, kalendář.
                S&nbsp;kamarádem, který tě drží.
              </p>

              <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
                <div className="flex flex-col items-center sm:items-start">
                  <PulseGlowButton href="/login" className="px-10 h-16 text-lg">
                    Vyzkoušet zdarma
                    <ChevronRight className="size-5" />
                  </PulseGlowButton>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Zdarma &bull; Bez kreditky &bull; Hotovo za 2 minuty
                  </p>
                </div>
                <SmoothScrollLink
                  href="#jak-to-funguje"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-8 h-16 text-base font-medium hover:bg-muted/50 hover:border-primary/20 transition-all duration-300"
                >
                  Zjistit víc ↓
                </SmoothScrollLink>
              </div>

              {/* Store badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-10">
                <StoreBadge store="apple" />
                <StoreBadge store="google" />
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <AppMockup />
        </div>
      </section>

      {/* ======== 2. PROBLEM — Navy bg ======== */}
      <section id="problem" className="relative py-28 md:py-36" style={{ backgroundColor: "#0B1120" }}>
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
            <div className="flex-1">
              <FadeInSection>
                <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4 max-w-3xl text-[#F5F0E8]">
                  Znáš to.
                </h2>
                <p className="text-lg md:text-xl text-[#94A3B8] mb-12 max-w-2xl leading-relaxed">
                  Každý rok stejný scénář. Motivace přijde a&nbsp;zase odejde.
                  A&nbsp;ty zůstaneš tam, kde jsi.
                </p>
              </FadeInSection>

              <div className="grid gap-4 sm:grid-cols-3 mb-10">
                {painPoints.map((point, i) => (
                  <FadeInSection key={point.text} delay={i * 120}>
                    <div className="group flex items-start gap-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 h-full hover:border-white/[0.15] hover:bg-white/[0.06] hover:scale-[1.02] transition-all duration-300">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{point.emoji}</span>
                      <span className="font-semibold text-sm md:text-base leading-relaxed block text-[#E2D9CC]">
                        {point.text}
                      </span>
                    </div>
                  </FadeInSection>
                ))}
              </div>

              <FadeInSection delay={400}>
                <div className="rounded-2xl bg-white/[0.04] border border-[#C8A84E]/20 p-6 md:p-8 max-w-2xl hover:border-[#C8A84E]/30 transition-all duration-300">
                  <p className="text-lg md:text-xl font-semibold leading-relaxed text-[#F5F0E8]">
                    Není to tvoje chyba.{" "}
                    <span className="text-[#C8A84E]">
                      Chybí ti systém, který tě DRŽÍ.
                    </span>
                  </p>
                </div>
              </FadeInSection>
            </div>

            {/* Goalie sad */}
            <FadeInSection delay={300} className="hidden md:flex flex-shrink-0 items-center justify-center mt-12">
              <Goalie mood="sad" size={140} className="opacity-80" />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ======== 3. SOLUTION — Cream bg ======== */}
      <section className="relative py-28 md:py-36 bg-background">
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
            {/* Goalie excited */}
            <FadeInSection delay={100} className="hidden md:flex flex-shrink-0 items-start justify-center mt-4">
              <Goalie mood="excited" size={140} />
            </FadeInSection>

            <div className="flex-1">
              <FadeInSection>
                <div className="mb-14">
                  <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
                    OurGoals to řeší{" "}
                    <span className="text-primary">jinak</span>
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                    Jedna app. Vše propojené. Gamifikace, která motivuje ne týden, ale měsíce.
                  </p>
                </div>
              </FadeInSection>

              <div className="grid gap-6 sm:grid-cols-3">
                {benefits.map((b, i) => (
                  <FadeInSection key={b.title} delay={i * 150}>
                    <div className="group rounded-2xl border border-border bg-card p-6 md:p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                        <b.icon className="size-6 text-primary" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold mb-2">
                        {b.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== 4. HOW IT WORKS — Cream bg with muted tint ======== */}
      <section id="jak-to-funguje" className="relative py-28 md:py-36 bg-muted/30">
        <div className="relative max-w-6xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-16">
              Jak to funguje
            </h2>
          </FadeInSection>

          <div className="grid gap-8 md:gap-0 md:grid-cols-3 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {steps.map((s, i) => (
              <FadeInSection key={s.num} delay={i * 200}>
                <div className="relative md:px-6">
                  {/* Gold numbered circle */}
                  <div className="relative z-10 size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-5 shadow-lg shadow-primary/20 hover:scale-110 transition-all duration-300">
                    <span className="font-mono text-lg font-bold">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                  {stepVisuals[s.visual]}
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 5. MODULES — Cream bg ======== */}
      <section className="py-28 md:py-36 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
              7 modulů. Tvůj výběr.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-14 max-w-xl leading-relaxed">
              Aktivuj jen to, co potřebuješ. Zbytek tě neruší. Kdykoliv můžeš přidat další.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {modules.map((m, i) => (
              <FadeInSection key={m.name} delay={i * 80}>
                <div className="group rounded-2xl border border-border bg-card p-5 md:p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <m.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-sm md:text-base font-semibold mb-1">
                    {m.name}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 6. GAMIFICATION — Cream bg with gold tint ======== */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-muted/30">
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
            <div className="flex-1">
              <FadeInSection>
                <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
                  Sbírej XP. Level up.
                  <br />
                  <span className="text-primary">Nepřeruš streak.</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl leading-relaxed">
                  Každá splněná úloha ti přinese body zkušeností. Rosteš, odemykáš
                  achievementy a&nbsp;udržuješ si streak. Čím déle vydržíš, tím víc to bolí vzdát se.
                </p>
              </FadeInSection>

              {/* Gold XP bar */}
              <FadeInSection delay={100}>
                <div className="max-w-lg mb-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Zap className="size-4 text-primary" />
                      </div>
                      <span className="font-heading text-sm font-semibold">
                        Level 12
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      2 450 / 3 000 XP
                    </span>
                  </div>
                  <AnimatedProgress
                    value={82}
                    barClassName="bg-gradient-to-r from-primary to-primary/70"
                  />
                </div>
              </FadeInSection>

              {/* Gold badges */}
              <FadeInSection delay={200}>
                <div className="flex flex-wrap gap-4 mb-10">
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 hover:bg-primary/15 hover:scale-105 transition-all duration-300">
                    <Trophy className="size-4 text-primary" />
                    <span className="text-sm font-medium">7denní streak</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 hover:bg-primary/15 hover:scale-105 transition-all duration-300">
                    <Flame className="size-4 text-primary" />
                    <span className="text-sm font-medium">Streak Master</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 hover:bg-primary/15 hover:scale-105 transition-all duration-300">
                    <Target className="size-4 text-primary" />
                    <span className="text-sm font-medium">First Goal</span>
                  </div>
                </div>
              </FadeInSection>

              {/* Animated streak counter */}
              <FadeInSection delay={300}>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
                  <span>
                    <AnimatedCounter
                      target={50}
                      className="text-foreground font-bold text-lg"
                    />{" "}
                    levelů
                  </span>
                  <span>
                    <AnimatedCounter
                      target={12}
                      className="text-foreground font-bold text-lg"
                    />{" "}
                    achievementů
                  </span>
                  <span>
                    <AnimatedCounter
                      target={47}
                      className="text-foreground font-bold text-lg"
                      suffix=" dní"
                    />{" "}
                    streak
                  </span>
                </div>
              </FadeInSection>
            </div>

            {/* Goalie celebrating */}
            <FadeInSection delay={200} className="hidden md:flex flex-shrink-0 items-center justify-center mt-12">
              <Goalie mood="celebrating" size={160} />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ======== 7. COACH — Cream bg ======== */}
      <section className="py-28 md:py-36 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInSection>
            <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
              {/* Goalie thinking */}
              <div className="hidden md:flex flex-shrink-0 items-start justify-center mt-2">
                <Goalie mood="thinking" size={120} />
              </div>
              <CoachToneDemo />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ======== 8. PRO KOHO — Cream bg with muted tint ======== */}
      <section id="pro-koho" className="relative py-28 md:py-36 bg-muted/30">
        <div className="relative max-w-6xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
              Pro koho je OurGoals?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-14 max-w-xl leading-relaxed">
              Pro každého, kdo chce přestat plánovat a začít plnit.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {personas.map((p, i) => (
              <FadeInSection key={p.title} delay={i * 120}>
                <div className="group rounded-2xl border border-border bg-card p-6 md:p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {p.emoji}
                    </div>
                    <h3 className="font-heading text-lg font-semibold">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {p.story}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 9. SOCIAL PROOF — Cream bg ======== */}
      <section className="py-28 md:py-36 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-14">
              Co říkají uživatelé
            </h2>
          </FadeInSection>

          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {testimonials.map((t, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="group rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <Quote className="size-8 text-primary/20 mb-4 flex-shrink-0 group-hover:text-primary/30 transition-colors" />
                  <p className="text-foreground leading-relaxed text-[15px] flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 10. COUPLES / FAMILY — Navy bg ======== */}
      <section className="relative py-28 md:py-36" style={{ backgroundColor: "#0B1120" }}>
        <div className="relative max-w-6xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center max-w-3xl mx-auto">
              {/* Two Goalies with gold heart */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <Goalie mood="happy" size={80} />
                <div className="flex items-center justify-center -mx-3">
                  <Heart className="size-7 text-[#C8A84E] animate-pulse" />
                </div>
                <Goalie mood="happy" size={80} />
              </div>

              <h2 className="font-heading text-2xl md:text-4xl font-bold mb-4 text-[#F5F0E8]">
                Pro páry a rodiny
              </h2>
              <p className="text-[#94A3B8] leading-relaxed max-w-md mx-auto text-lg">
                Sdílený kalendář, partnerské vzkazy, společné cíle. Plánujte
                spolu, motivujte se navzájem. Protože společné cíle drží víc.
              </p>
              <div className="mt-8">
                <span className="inline-flex items-center rounded-full bg-[#C8A84E]/10 border border-[#C8A84E]/20 px-5 py-2.5 text-sm font-medium text-[#C8A84E]">
                  Připravujeme
                </span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ======== 11. FINAL CTA — Navy bg ======== */}
      <section className="relative py-28 md:py-36 overflow-hidden" style={{ backgroundColor: "#0B1120" }}>
        <FloatingParticles count={15} />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <FadeInSection>
            {/* Goalie waving */}
            <div className="flex justify-center mb-8">
              <Goalie mood="waving" size={120} />
            </div>

            <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-[#C8A84E]">
              Přidej se k nám!
              <br />
              <span className="text-[#F5F0E8]">
                Zítra budeš o den dál.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#94A3B8] mb-10 max-w-lg mx-auto leading-relaxed">
              Každý den, kdy odkládáš, je den, kdy nerosteš. Začni teď — s&nbsp;Goaliem po boku.
            </p>

            <PulseGlowButton href="/login" className="px-14 h-16 text-lg">
              Vyzkoušet zdarma
              <ChevronRight className="size-5" />
            </PulseGlowButton>

            <p className="mt-5 text-sm text-[#94A3B8]">
              Zdarma &bull; Bez kreditky &bull; Funguje na mobilu i počítači
            </p>

            {/* Store badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <StoreBadge store="apple" />
              <StoreBadge store="google" />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ======== 12. FOOTER — Cream bg, minimal ======== */}
      <footer className="py-14 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4">
          {/* Tagline */}
          <div className="text-center mb-10">
            <p className="font-heading text-xl md:text-2xl font-bold tracking-tight text-muted-foreground/60">
              Tvůj den. Tvůj plán. Tvůj Goalie.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + badge */}
            <div className="flex items-center gap-4">
              <span className="font-heading text-lg font-bold tracking-tight">
                <span className="text-primary">Our</span>Goals
              </span>
              <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                Vytvořeno v Česku
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Ochrana soukromí
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Podmínky
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Kontakt
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="size-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="size-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} OurGoals. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
