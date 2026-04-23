export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-start justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
