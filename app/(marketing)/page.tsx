import Link from "next/link";
import {
  Target,
  Layers,
  Flame,
  X,
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
} from "@/components/domain/landing/landing-client";
import { AppMockup } from "@/components/domain/landing/app-mockup";

/* ─── DATA ─── */

const personas = [
  {
    emoji: "🏋️",
    title: "Sportovci",
    desc: "Chceš trénovat pravidelně a sledovat progres",
  },
  {
    emoji: "📊",
    title: "Produktivní lidé",
    desc: "Chceš mít den pod kontrolou a neztratit focus",
  },
  {
    emoji: "❤️",
    title: "Páry a rodiny",
    desc: "Chcete se lépe organizovat a komunikovat",
  },
  {
    emoji: "🎯",
    title: "Kdokoliv s cílem",
    desc: "Máš cíl a potřebuješ systém, který tě udrží",
  },
];

const painPoints = [
  "Stáhneš si 5 appek — a nic z toho nepoužíváš",
  "Zapíšeš cíl — a za týden na něj zapomeneš",
  "Nemáš systém — jen dobré úmysly",
];

const benefits = [
  {
    icon: Target,
    title: "Vyber si co chceš řídit",
    desc: "Modulární systém. Aktivuj jen to, co potřebuješ.",
  },
  {
    icon: Layers,
    title: "Všechno na jednom místě",
    desc: "Cíle, trénink, jídlo, spánek, práce — propojené.",
  },
  {
    icon: Flame,
    title: "Gamifikace tě udrží",
    desc: "XP, levely, streaky, achievementy. Motivace každý den.",
  },
];

const steps = [
  {
    num: "01",
    title: "Vyber si moduly",
    desc: "Trénink? Jídlo? Kalendář? Práce? Vyber jen to, co potřebuješ.",
    visual: "modules",
  },
  {
    num: "02",
    title: "Nastav si cíle",
    desc: "Definuj co chceš dosáhnout. App ti vytvoří denní checklist.",
    visual: "goal",
  },
  {
    num: "03",
    title: "Plň a sbírej XP",
    desc: "Každý den plníš úkoly, sbíráš body, rosteš v levelu.",
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
    text: "Konečně jedna app na všechno. Nemusím přepínat mezi 5 appkami.",
    author: "M.",
    age: 28,
  },
  {
    text: "Streak mě drží. 47 dní v řadě a nechci přestat.",
    author: "T.",
    age: 34,
  },
  {
    text: "Gamifikace funguje. Cítím se jako v RPG, jen místo questů plním reálné cíle.",
    author: "K.",
    age: 26,
  },
];

/* ─── STEP VISUALS ─── */

function StepModulesVisual() {
  const colors = [
    "bg-primary/20 text-primary",
    "bg-gold/20 text-gold",
    "bg-son/20 text-son",
    "bg-destructive/20 text-destructive",
    "bg-primary/20 text-primary",
    "bg-gold/20 text-gold",
  ];
  const icons = [Target, Dumbbell, UtensilsCrossed, CalendarDays, Moon, Briefcase];

  return (
    <div className="grid grid-cols-3 gap-1.5 mt-4 max-w-[120px]">
      {icons.map((Icon, i) => (
        <div
          key={i}
          className={`size-9 rounded-lg flex items-center justify-center ${colors[i]}`}
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
      <div className="flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/20 px-3 py-1.5">
        <Flame className="size-3.5 text-gold" />
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

/* ─── PAGE ─── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <StickyHeader />

      {/* ======== 1. HERO ======== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
          {/* Logo */}
          <div className="mb-12 md:mb-16">
            <span className="font-heading text-xl font-bold tracking-tight">
              <span className="text-primary">Our</span>Goals
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Cíle. Návyky. Trénink.
            <br />
            <span className="text-primary">Jídlo. Kalendář.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Vše propojené na jednom místě. S&nbsp;XP, levely a&nbsp;streaky,
            které tě udrží.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 h-12 text-base font-semibold hover:bg-primary/90 transition-colors"
            >
              Začít zdarma
              <ChevronRight className="ml-1 size-4" />
            </Link>
            <SmoothScrollLink
              href="#pro-koho"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 h-12 text-base font-medium hover:bg-muted transition-colors"
            >
              Podívat se ↓
            </SmoothScrollLink>
          </div>

          <AppMockup />
        </div>
      </section>

      {/* ======== 2. PRO KOHO ======== */}
      <section id="pro-koho" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-12">
            Pro koho je OurGoals?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {personas.map((p) => (
              <div
                key={p.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 md:p-6 hover:border-primary/20 transition-colors"
              >
                <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {p.emoji}
                </div>
                <div>
                  <h3 className="font-heading text-base md:text-lg font-semibold mb-1">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 3. PROBLEM ======== */}
      <section id="problem" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-12 max-w-3xl">
            Znáš to. Začneš v&nbsp;lednu,
            <br />
            <span className="text-muted-foreground">v&nbsp;únoru to vzdáš.</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            {painPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-xl bg-destructive/5 border border-destructive/10 p-4"
              >
                <div className="flex-shrink-0 size-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="size-4 text-destructive" />
                </div>
                <span className="font-medium text-sm md:text-base">{point}</span>
              </div>
            ))}
          </div>

          <p className="text-lg text-primary font-semibold max-w-2xl leading-relaxed">
            OurGoals je systém, který funguje. Protože je propojený
            a&nbsp;protože tě baví.
          </p>
        </div>
      </section>

      {/* ======== 4. SOLUTION ======== */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
              OurGoals to řeší jinak
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Jedna app. Vše propojené. Gamifikace, která motivuje.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-border bg-card p-6 md:p-8 hover:border-primary/30 transition-colors"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <b.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  {b.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 5. HOW IT WORKS ======== */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-14">
            Jak to funguje
          </h2>

          <div className="grid gap-8 md:gap-12 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <span className="font-mono text-5xl font-bold text-primary/15 mb-4 block">
                  {s.num}
                </span>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  {s.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
                {stepVisuals[s.visual]}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 6. MODULES ======== */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
            7 modulů. Tvůj výběr.
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl">
            Aktivuj jen to, co potřebuješ. Zbytek tě neruší.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {modules.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-border bg-card p-5 md:p-6 hover:border-primary/20 transition-colors"
              >
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <m.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-heading text-sm md:text-base font-semibold mb-1">
                  {m.name}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 7. GAMIFICATION ======== */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
            Sbírej XP. Level up.
            <br />
            <span className="text-gold">Nepřeruš streak.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl">
            Každá splněná úloha ti přinese body zkušeností. Rosteš, odemykáš
            achievementy a&nbsp;udržuješ si streak.
          </p>

          {/* Animated XP bar */}
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
            <AnimatedProgress value={82} />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-4 py-2">
              <Trophy className="size-4 text-gold" />
              <span className="text-sm font-medium">7denní streak</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
              <Flame className="size-4 text-primary" />
              <span className="text-sm font-medium">Streak Master</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-son/10 border border-son/20 px-4 py-2">
              <Target className="size-4 text-son" />
              <span className="text-sm font-medium">First Goal</span>
            </div>
          </div>

          {/* Animated streak counter */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground mb-8">
            <span>
              <AnimatedCounter
                target={50}
                className="text-foreground font-bold"
              />{" "}
              levelů
            </span>
            <span>
              <AnimatedCounter
                target={12}
                className="text-foreground font-bold"
              />{" "}
              achievementů
            </span>
            <span>
              <AnimatedCounter
                target={47}
                className="text-foreground font-bold"
                suffix=" dní"
              />{" "}
              streak
            </span>
          </div>

          {/* Coach tone selector */}
          <CoachToneDemo />
        </div>
      </section>

      {/* ======== 8. SOCIAL PROOF ======== */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-12">
            Co říkají uživatelé
          </h2>

          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col"
              >
                <Quote className="size-6 text-primary/30 mb-4" />
                <p className="text-foreground leading-relaxed mb-6 flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  — {t.author}, {t.age}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-lg md:text-xl font-heading font-semibold text-primary">
            Sleduj. Plň. Level up.
          </p>
        </div>
      </section>

      {/* ======== 9. COUPLES / FAMILY TEASER ======== */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card/50 p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="size-14 rounded-2xl bg-son/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="size-7 text-son" />
            </div>
            <h2 className="font-heading text-2xl md:text-4xl font-bold mb-4">
              Pro páry a rodiny
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Sdílený kalendář, partnerské vzkazy, společné cíle. Plánujte
              spolu, motivujte se navzájem.
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center rounded-full bg-son/10 border border-son/20 px-4 py-2 text-sm font-medium text-son">
                Připravujeme
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======== 10. FINAL CTA ======== */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
            Připraven změnit
            <br />
            <span className="text-primary">svůj život?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            Registrace zabere 2 minuty. Žádná kreditka.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-10 h-14 text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Začít zdarma
            <ChevronRight className="ml-1 size-5" />
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">
            Funguje na mobilu i počítači
          </p>
        </div>
      </section>

      {/* ======== 11. FOOTER ======== */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-bold tracking-tight">
            <span className="text-primary">Our</span>Goals
          </span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Ochrana soukromí
            </a>
            <span className="text-border">|</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Podmínky
            </a>
            <span className="text-border">|</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Kontakt
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OurGoals. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    </div>
  );
}
