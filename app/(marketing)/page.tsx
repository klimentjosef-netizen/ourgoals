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
  Check,
} from "lucide-react";
import {
  StickyHeader,
  SmoothScrollLink,
  AnimatedCounter,
  AnimatedProgress,
  CoachToneDemo,
  FadeInSection,
} from "@/components/domain/landing/landing-client";
import { AppMockup } from "@/components/domain/landing/app-mockup";

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
      "Sdílený kalendář, společné cíle, partnerské vzkazy. Konečně víte kdo co dělá, plánujete spolu a motivujete se navzájem. Žádné 'já jsem ti to říkal'.",
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
    text: "Pondělí: 'Od zítřka cvičím.' Pátek: Netflix a čipsy.",
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
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
          {/* Logo */}
          <div className="mb-12 md:mb-16">
            <span className="font-heading text-xl font-bold tracking-tight">
              <span className="text-primary">Our</span>Goals
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            Přestaň plánovat.
            <br />
            <span className="text-primary">Začni plnit.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Jeden systém na cíle, návyky, trénink, jídlo i&nbsp;kalendář.
            S&nbsp;gamifikací, která tě udrží. Každý den.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-8 h-14 text-base font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
                >
                  Začít zdarma
                  <ChevronRight className="ml-1 size-5" />
                </Link>
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
                  Zdarma
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Zdarma &bull; Bez kreditky &bull; Hotovo za 2 minuty
              </p>
            </div>
            <SmoothScrollLink
              href="#jak-to-funguje"
              className="inline-flex items-center justify-center rounded-xl border border-border px-8 h-14 text-base font-medium hover:bg-muted transition-colors"
            >
              Jak to funguje ↓
            </SmoothScrollLink>
          </div>

          <AppMockup />
        </div>
      </section>

      {/* ======== 2. PROBLEM ======== */}
      <section id="problem" className="relative py-20 md:py-28 bg-muted/40 border-y border-destructive/5">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/[0.02] to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4 max-w-3xl">
              Znáš to.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl">
              Každý rok stejný scénář. Motivace přijde a zase odejde. A&nbsp;ty zůstaneš tam, kde jsi.
            </p>
          </FadeInSection>

          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            {painPoints.map((point, i) => (
              <FadeInSection key={point.text} delay={i * 120}>
                <div className="flex items-start gap-4 rounded-2xl bg-destructive/5 border border-destructive/10 p-5 h-full">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{point.emoji}</span>
                  <div>
                    <span className="font-semibold text-sm md:text-base leading-relaxed block">
                      {point.text}
                    </span>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection delay={400}>
            <div className="rounded-2xl bg-card border border-primary/20 p-6 md:p-8 max-w-2xl">
              <p className="text-lg md:text-xl font-semibold leading-relaxed">
                Není to tvoje chyba.{" "}
                <span className="text-primary">
                  Chybí ti systém, který tě DRŽÍ.
                </span>
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ======== 3. SOLUTION ======== */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <div className="mb-14">
              <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
                OurGoals to řeší jinak
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Jedna app. Vše propojené. Gamifikace, která motivuje ne týden, ale měsíce.
              </p>
            </div>
          </FadeInSection>

          <div className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b, i) => (
              <FadeInSection key={b.title} delay={i * 150}>
                <div className="group rounded-2xl border border-border bg-card p-6 md:p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
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
      </section>

      {/* ======== 4. HOW IT WORKS ======== */}
      <section id="jak-to-funguje" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-14">
              Jak to funguje
            </h2>
          </FadeInSection>

          <div className="grid gap-8 md:gap-0 md:grid-cols-3 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {steps.map((s, i) => (
              <FadeInSection key={s.num} delay={i * 200}>
                <div className="relative md:px-6">
                  {/* Step number circle */}
                  <div className="relative z-10 size-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5">
                    <span className="font-mono text-lg font-bold text-primary">
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

      {/* ======== 5. MODULES ======== */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
              7 modulů. Tvůj výběr.
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl">
              Aktivuj jen to, co potřebuješ. Zbytek tě neruší. Kdykoliv můžeš přidat další.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {modules.map((m, i) => (
              <FadeInSection key={m.name} delay={i * 80}>
                <div className="group rounded-2xl border border-border bg-card p-5 md:p-6 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
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

      {/* ======== 6. GAMIFICATION ======== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Warm gold tint background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] via-gold/[0.06] to-gold/[0.02] pointer-events-none" />
        <div className="absolute inset-0 bg-muted/30 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
              Sbírej XP. Level up.
              <br />
              <span className="text-gold">Nepřeruš streak.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl">
              Každá splněná úloha ti přinese body zkušeností. Rosteš, odemykáš
              achievementy a&nbsp;udržuješ si streak. Čím déle vydržíš, tím víc to bolí vzdát se.
            </p>
          </FadeInSection>

          {/* Animated XP bar */}
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
              <AnimatedProgress value={82} />
            </div>
          </FadeInSection>

          {/* Badges */}
          <FadeInSection delay={200}>
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-4 py-2 hover:bg-gold/15 transition-colors">
                <Trophy className="size-4 text-gold" />
                <span className="text-sm font-medium">7denní streak</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 hover:bg-primary/15 transition-colors">
                <Flame className="size-4 text-primary" />
                <span className="text-sm font-medium">Streak Master</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-son/10 border border-son/20 px-4 py-2 hover:bg-son/15 transition-colors">
                <Target className="size-4 text-son" />
                <span className="text-sm font-medium">First Goal</span>
              </div>
            </div>
          </FadeInSection>

          {/* Animated streak counter */}
          <FadeInSection delay={300}>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground mb-12">
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
      </section>

      {/* ======== 7. COACH ======== */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <CoachToneDemo />
          </FadeInSection>
        </div>
      </section>

      {/* ======== 8. PRO KOHO ======== */}
      <section id="pro-koho" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
              Pro koho je OurGoals?
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl">
              Pro každého, kdo chce přestat plánovat a začít plnit.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {personas.map((p, i) => (
              <FadeInSection key={p.title} delay={i * 120}>
                <div className="group rounded-2xl border border-border bg-card p-6 md:p-7 hover:border-primary/20 hover:shadow-md transition-all duration-300 h-full">
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

      {/* ======== 9. SOCIAL PROOF ======== */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-12">
              Co říkají uživatelé
            </h2>
          </FadeInSection>

          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {testimonials.map((t, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col h-full hover:border-primary/15 transition-colors">
                  <Quote className="size-8 text-primary/20 mb-4 flex-shrink-0" />
                  <p className="text-foreground leading-relaxed text-[15px] flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 10. COUPLES / FAMILY TEASER ======== */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <div className="rounded-3xl border border-son/15 bg-card/50 backdrop-blur-sm p-8 md:p-12 text-center max-w-2xl mx-auto hover:border-son/25 transition-colors">
              <div className="size-14 rounded-2xl bg-son/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="size-7 text-son" />
              </div>
              <h2 className="font-heading text-2xl md:text-4xl font-bold mb-4">
                Pro páry a rodiny
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                Sdílený kalendář, partnerské vzkazy, společné cíle. Plánujte
                spolu, motivujte se navzájem. Protože společné cíle drží víc.
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center rounded-full bg-son/10 border border-son/20 px-4 py-2 text-sm font-medium text-son">
                  Připravujeme
                </span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ======== 11. FINAL CTA ======== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Gradient background matching hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/5 to-primary/8 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <FadeInSection>
            <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Začni dnes.
              <br />
              <span className="text-primary">Zítra budeš o den dál.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
              Každý den, kdy odkládáš, je den, kdy nerosteš. Začni teď.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-12 h-16 text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Začít zdarma
              <ChevronRight className="ml-2 size-5" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Zdarma &bull; Bez kreditky &bull; Funguje na mobilu i počítači
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ======== 12. FOOTER ======== */}
      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + badge */}
            <div className="flex items-center gap-4">
              <span className="font-heading text-lg font-bold tracking-tight">
                <span className="text-primary">Our</span>Goals
              </span>
              <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                Vytvořeno v Česku 🇨🇿
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
                className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
                aria-label="Twitter"
              >
                <svg className="size-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
                aria-label="Instagram"
              >
                <svg className="size-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} OurGoals. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
