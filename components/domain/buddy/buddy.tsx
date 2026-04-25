"use client";

type BuddyMood = "happy" | "excited" | "sad" | "thinking" | "celebrating" | "waving";

interface BuddyProps {
  mood: BuddyMood;
  size?: number;
  className?: string;
}

export function Buddy({ mood, size = 120, className = "" }: BuddyProps) {
  const scale = size / 120;

  // Mouth paths per mood
  const mouthPath: Record<BuddyMood, string> = {
    happy: "M 48 72 Q 60 82 72 72",
    excited: "M 46 70 Q 60 86 74 70",
    sad: "M 48 78 Q 60 70 72 78",
    thinking: "M 52 74 Q 60 78 68 74",
    celebrating: "M 44 70 Q 60 88 76 70",
    waving: "M 48 72 Q 60 82 72 72",
  };

  // Eye style per mood
  const getEyes = () => {
    switch (mood) {
      case "excited":
        return (
          <>
            {/* Sparkle eyes */}
            <path d="M 46 56 L 48 52 L 50 56 L 48 60 Z" fill="oklch(0.65 0.2 270)" />
            <path d="M 44 58 L 52 58" stroke="oklch(0.65 0.2 270)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 70 56 L 72 52 L 74 56 L 72 60 Z" fill="oklch(0.65 0.2 270)" />
            <path d="M 68 58 L 76 58" stroke="oklch(0.65 0.2 270)" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case "sad":
        return (
          <>
            {/* Droopy eyes */}
            <ellipse cx="48" cy="58" rx="6" ry="5" fill="white" />
            <ellipse cx="72" cy="58" rx="6" ry="5" fill="white" />
            <circle cx="47" cy="59" r="2.5" fill="#1a1625" />
            <circle cx="71" cy="59" r="2.5" fill="#1a1625" />
            {/* Droopy lids */}
            <path d="M 42 54 Q 48 56 54 55" stroke="#1a1625" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
            <path d="M 66 55 Q 72 56 78 54" stroke="#1a1625" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
          </>
        );
      case "thinking":
        return (
          <>
            {/* One eye normal, one squinting */}
            <ellipse cx="48" cy="57" rx="6" ry="6" fill="white" />
            <circle cx="47" cy="57" r="2.5" fill="#1a1625" />
            {/* Squinting eye */}
            <path d="M 66 57 Q 72 54 78 57" stroke="#1a1625" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );
      default:
        return (
          <>
            {/* Normal eyes with blink animation */}
            <ellipse cx="48" cy="57" rx="6" ry="6" fill="white" className="animate-buddy-blink" />
            <ellipse cx="72" cy="57" rx="6" ry="6" fill="white" className="animate-buddy-blink" />
            <circle cx="47" cy="56.5" r="2.8" fill="#1a1625" />
            <circle cx="71" cy="56.5" r="2.8" fill="#1a1625" />
            {/* Eye shine */}
            <circle cx="48.5" cy="55" r="1" fill="white" opacity="0.9" />
            <circle cx="72.5" cy="55" r="1" fill="white" opacity="0.9" />
          </>
        );
    }
  };

  // Arms / extras per mood
  const getExtras = () => {
    switch (mood) {
      case "celebrating":
        return (
          <>
            {/* Arms up */}
            <path d="M 35 80 Q 28 65 24 55" stroke="oklch(0.65 0.2 270)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M 85 80 Q 92 65 96 55" stroke="oklch(0.65 0.2 270)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
            {/* Confetti sparkles */}
            <circle cx="22" cy="40" r="2" fill="oklch(0.7 0.18 30)" className="animate-buddy-sparkle" />
            <circle cx="98" cy="42" r="2" fill="oklch(0.78 0.14 85)" className="animate-buddy-sparkle" style={{ animationDelay: "0.3s" }} />
            <circle cx="30" cy="30" r="1.5" fill="oklch(0.78 0.14 85)" className="animate-buddy-sparkle" style={{ animationDelay: "0.6s" }} />
            <circle cx="90" cy="32" r="1.5" fill="oklch(0.65 0.2 270)" className="animate-buddy-sparkle" style={{ animationDelay: "0.9s" }} />
            <path d="M 25 35 L 27 33 L 29 35 L 27 37 Z" fill="oklch(0.7 0.18 30)" className="animate-buddy-sparkle" style={{ animationDelay: "0.15s" }} />
            <path d="M 93 36 L 95 34 L 97 36 L 95 38 Z" fill="oklch(0.78 0.14 85)" className="animate-buddy-sparkle" style={{ animationDelay: "0.45s" }} />
          </>
        );
      case "waving":
        return (
          <>
            {/* Waving arm */}
            <path d="M 85 80 Q 95 68 92 52" stroke="oklch(0.65 0.2 270)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" className="animate-buddy-wave" style={{ transformOrigin: "85px 80px" }} />
            {/* Small hand */}
            <circle cx="92" cy="50" r="4" fill="oklch(0.75 0.15 270)" opacity="0.6" className="animate-buddy-wave" style={{ transformOrigin: "85px 80px" }} />
          </>
        );
      case "thinking":
        return (
          <>
            {/* Hand on chin */}
            <path d="M 35 82 Q 30 75 38 72" stroke="oklch(0.65 0.2 270)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Thinking dots */}
            <circle cx="88" cy="42" r="2" fill="oklch(0.65 0.2 270)" opacity="0.4" className="animate-buddy-think" />
            <circle cx="94" cy="36" r="2.5" fill="oklch(0.65 0.2 270)" opacity="0.3" className="animate-buddy-think" style={{ animationDelay: "0.3s" }} />
            <circle cx="98" cy="28" r="3" fill="oklch(0.65 0.2 270)" opacity="0.2" className="animate-buddy-think" style={{ animationDelay: "0.6s" }} />
          </>
        );
      default:
        return null;
    }
  };

  const floatClass = mood === "celebrating" ? "animate-buddy-bounce" : "animate-buddy-float";

  return (
    <div className={`inline-flex ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={floatClass}
        role="img"
        aria-label={`Buddy maskot — nálada: ${mood}`}
      >
        {/* === Backpack (behind body) === */}
        <rect x="65" y="62" width="22" height="28" rx="8" fill="oklch(0.7 0.18 30)" opacity="0.85" />
        <rect x="69" y="67" width="14" height="8" rx="3" fill="oklch(0.75 0.2 30)" opacity="0.6" />
        {/* Backpack strap */}
        <path d="M 72 62 Q 72 56 68 52" stroke="oklch(0.6 0.16 30)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />

        {/* === Body hint === */}
        <ellipse cx="60" cy="95" rx="22" ry="16" fill="oklch(0.72 0.13 270)" />

        {/* === Head (main circle) === */}
        <circle cx="60" cy="58" r="32" fill="oklch(0.75 0.15 270)" />
        {/* Head highlight */}
        <ellipse cx="53" cy="46" rx="14" ry="10" fill="oklch(0.82 0.1 270)" opacity="0.4" />

        {/* === Ears === */}
        <path d="M 34 38 L 28 18 L 44 32 Z" fill="oklch(0.72 0.13 270)" />
        <path d="M 36 36 L 32 22 L 43 33 Z" fill="oklch(0.8 0.12 300)" opacity="0.5" />
        <path d="M 86 38 L 92 18 L 76 32 Z" fill="oklch(0.72 0.13 270)" />
        <path d="M 84 36 L 88 22 L 77 33 Z" fill="oklch(0.8 0.12 300)" opacity="0.5" />

        {/* === Eyes === */}
        {getEyes()}

        {/* === Nose === */}
        <ellipse cx="60" cy="65" rx="3" ry="2" fill="oklch(0.6 0.15 300)" opacity="0.6" />

        {/* === Mouth === */}
        <path d={mouthPath[mood]} stroke="#1a1625" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* === Cheek blush === */}
        <ellipse cx="40" cy="66" rx="5" ry="3" fill="oklch(0.7 0.18 30)" opacity="0.25" />
        <ellipse cx="80" cy="66" rx="5" ry="3" fill="oklch(0.7 0.18 30)" opacity="0.25" />

        {/* === Mood-specific extras === */}
        {getExtras()}
      </svg>

      <style jsx>{`
        @keyframes buddy-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes buddy-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          30% { transform: translateY(-8px) scale(1.03); }
          60% { transform: translateY(-2px) scale(0.98); }
        }
        @keyframes buddy-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes buddy-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes buddy-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes buddy-think {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-3px); }
        }
        .animate-buddy-float {
          animation: buddy-float 3s ease-in-out infinite;
        }
        .animate-buddy-bounce {
          animation: buddy-bounce 1.5s ease-in-out infinite;
        }
        .animate-buddy-blink {
          animation: buddy-blink 4s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-buddy-sparkle {
          animation: buddy-sparkle 1.5s ease-in-out infinite;
        }
        .animate-buddy-wave {
          animation: buddy-wave 1s ease-in-out infinite;
        }
        .animate-buddy-think {
          animation: buddy-think 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
