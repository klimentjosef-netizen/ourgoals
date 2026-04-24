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
} from "lucide-react";
import {
  StickyHeader,
  SmoothScrollLink,
} from "@/components/domain/landing/landing-client";

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

const painPoints = [
  "Fitness tracker zvlášť",
  "Todo appka zvlášť",
  "Kalendář zvlášť",
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
  },
  {
    num: "02",
    title: "Nastav si cíle",
    desc: "Definuj co chceš dosáhnout. App ti vytvoří denní checklist.",
  },
  {
    num: "03",
    title: "Plň a sbírej XP",
    desc: "Každý den plníš úkoly, sbíráš body, rosteš v levelu.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <StickyHeader />

      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Logo */}
          <div className="mb-12 md:mb-16">
            <span className="font-heading text-xl font-bold tracking-tight">
              <span className="text-primary">Our</span>Goals
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Jeden plán
            <br />
            <span className="text-primary">na celý život.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Cíle, návyky, trénink, jídlo, kalendář, spánek — vše na jednom
            místě. S gamifikací, která tě udrží.
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
              href="#problem"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 h-12 text-base font-medium hover:bg-muted transition-colors"
            >
              Zjistit víc ↓
            </SmoothScrollLink>
          </div>
        </div>
      </section>

      {/* ======== PROBLEM ======== */}
      <section id="problem" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-12 max-w-3xl">
            Máš cíle v 5 appkách
            <br />
            <span className="text-muted-foreground">a neplníš žádné?</span>
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
                <span className="font-medium">{point}</span>
              </div>
            ))}
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            A výsledek? Nic z toho nefunguje, protože to není propojené.
            Přepínáš mezi appkami, ztrácíš motivaci, a po týdnu to vzdáš.
          </p>
        </div>
      </section>

      {/* ======== SOLUTION ======== */}
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

      {/* ======== HOW IT WORKS ======== */}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== MODULES ======== */}
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

      {/* ======== GAMIFICATION ======== */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
            Sbírej XP. Level up.
            <br />
            <span className="text-gold">Nepřeruš streak.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl">
            Každá splněná úloha ti přinese body zkušeností. Rosteš, odemykáš
            achievementy a udržuješ si streak.
          </p>

          {/* XP bar mockup */}
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
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                style={{ width: "82%" }}
              />
            </div>
          </div>

          {/* Badges mockup */}
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

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">50</strong> levelů
            </span>
            <span>
              <strong className="text-foreground">12</strong> achievementů
            </span>
            <span>
              <strong className="text-foreground">Denní</strong> streak
            </span>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-5 max-w-md">
            <p className="text-sm text-muted-foreground mb-2">
              Vyber si tón kouče:
            </p>
            <div className="flex flex-wrap gap-2">
              {["Přísný", "Kamarádský", "Klidný", "Energický", "Minimální"].map(
                (tone) => (
                  <span
                    key={tone}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                  >
                    {tone}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======== COUPLES / FAMILY TEASER ======== */}
      <section className="py-20 md:py-28">
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

      {/* ======== FINAL CTA ======== */}
      <section className="py-20 md:py-28 bg-muted/30">
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

      {/* ======== FOOTER ======== */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-bold tracking-tight">
            <span className="text-primary">Our</span>Goals
          </span>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OurGoals. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    </div>
  );
}
