export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center sm:justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-8 pb-24 overflow-x-hidden">
      <p className="text-xs font-bold text-muted-foreground/50 tracking-widest uppercase mb-6">
        OurGoals
      </p>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
