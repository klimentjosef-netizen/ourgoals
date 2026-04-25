"use client";

type GoalieMood = "happy" | "excited" | "sad" | "thinking" | "celebrating" | "waving";

interface GoalieProps {
  mood?: GoalieMood;
  size?: number;
  className?: string;
}

export function Goalie({ mood = "happy", size = 120, className }: GoalieProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`goalie-float ${mood === "celebrating" ? "goalie-bounce" : ""} ${className ?? ""}`}
    >
      <style>{`
        .goalie-float { animation: goalie-float 3s ease-in-out infinite; }
        .goalie-bounce { animation: goalie-bounce 0.6s ease-in-out infinite; }
        .goalie-blink { animation: goalie-blink 4s ease-in-out infinite; }
        .goalie-wave { animation: goalie-wave 1s ease-in-out infinite; }
        @keyframes goalie-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes goalie-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes goalie-blink { 0%,45%,55%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
        @keyframes goalie-wave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-10deg); } }
      `}</style>

      {/* Backpack (behind body) — gold */}
      <rect x="72" y="45" width="18" height="24" rx="9" fill="#C8A84E" opacity="0.9" />
      <rect x="76" y="48" width="10" height="3" rx="1.5" fill="#B08A30" />

      {/* Body — teardrop blob, navy */}
      <ellipse cx="60" cy="62" rx="32" ry="38" fill="#1E293B" />

      {/* Ears — soft rounded bumps (NOT pointy) */}
      <ellipse cx="43" cy="30" rx="7" ry="5" fill="#1E293B" />
      <ellipse cx="77" cy="30" rx="7" ry="5" fill="#1E293B" />
      <ellipse cx="43" cy="31" rx="4.5" ry="3" fill="#2D3A50" />
      <ellipse cx="77" cy="31" rx="4.5" ry="3" fill="#2D3A50" />

      {/* Cheeks — gold blush */}
      <circle cx="42" cy="66" r="5.5" fill="#C8A84E" opacity="0.15" />
      <circle cx="78" cy="66" r="5.5" fill="#C8A84E" opacity="0.15" />

      {/* Eyes */}
      <g className="goalie-blink">
        <ellipse cx="48" cy="55" rx="8" ry="9" fill="white" />
        <ellipse cx="72" cy="55" rx="7" ry="8" fill="white" />
        {mood === "sad" ? (
          <>
            <circle cx="49" cy="58" r="3.5" fill="#1E293B" />
            <circle cx="71" cy="58" r="3" fill="#1E293B" />
          </>
        ) : mood === "excited" || mood === "celebrating" ? (
          <>
            <circle cx="49" cy="55" r="4" fill="#1E293B" />
            <circle cx="48" cy="53" r="1.5" fill="white" />
            <circle cx="71" cy="55" r="3.5" fill="#1E293B" />
            <circle cx="70" cy="53" r="1.5" fill="white" />
          </>
        ) : mood === "thinking" ? (
          <>
            <circle cx="49" cy="56" r="3.5" fill="#1E293B" />
            <ellipse cx="72" cy="56" rx="3" ry="2" fill="#1E293B" />
          </>
        ) : (
          <>
            <circle cx="49" cy="55" r="3.5" fill="#1E293B" />
            <circle cx="48" cy="53" r="1" fill="white" />
            <circle cx="71" cy="55" r="3" fill="#1E293B" />
            <circle cx="70" cy="53" r="1" fill="white" />
          </>
        )}
      </g>

      {/* Mouth */}
      {mood === "sad" ? (
        <path d="M52 74 Q60 68 68 74" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : mood === "excited" || mood === "celebrating" ? (
        <path d="M50 68 Q60 80 70 68" stroke="#C8A84E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === "thinking" ? (
        <line x1="53" y1="72" x2="62" y2="72" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M52 70 Q60 78 68 70" stroke="#C8A84E" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* Arms */}
      {mood === "waving" ? (
        <>
          <ellipse cx="30" cy="68" rx="6" ry="4" fill="#1E293B" />
          <g className="goalie-wave" style={{ transformOrigin: "90px 60px" }}>
            <ellipse cx="92" cy="50" rx="6" ry="4" fill="#1E293B" transform="rotate(-30 92 50)" />
          </g>
        </>
      ) : mood === "celebrating" ? (
        <>
          <ellipse cx="28" cy="48" rx="6" ry="4" fill="#1E293B" transform="rotate(-40 28 48)" />
          <ellipse cx="92" cy="48" rx="6" ry="4" fill="#1E293B" transform="rotate(40 92 48)" />
        </>
      ) : (
        <>
          <ellipse cx="30" cy="68" rx="6" ry="4" fill="#1E293B" />
          <ellipse cx="90" cy="68" rx="6" ry="4" fill="#1E293B" />
        </>
      )}

      {/* Thinking dots */}
      {mood === "thinking" && (
        <>
          <circle cx="78" cy="38" r="2" fill="#C8A84E" opacity="0.4" />
          <circle cx="85" cy="30" r="2.5" fill="#C8A84E" opacity="0.3" />
          <circle cx="90" cy="22" r="3" fill="#C8A84E" opacity="0.2" />
        </>
      )}

      {/* Celebrating confetti — gold */}
      {mood === "celebrating" && (
        <>
          <circle cx="22" cy="22" r="2.5" fill="#C8A84E" opacity="0.7" />
          <circle cx="98" cy="18" r="2" fill="#C8A84E" opacity="0.6" />
          <rect x="15" y="38" width="4" height="4" rx="1" fill="#C8A84E" opacity="0.5" transform="rotate(30 17 40)" />
          <rect x="100" y="32" width="3" height="3" rx="1" fill="#C8A84E" opacity="0.4" transform="rotate(-20 101 33)" />
          <circle cx="35" cy="15" r="1.5" fill="#C8A84E" opacity="0.5" />
          <circle cx="85" cy="10" r="1.5" fill="#C8A84E" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

// Backward compat
export { Goalie as Buddy };
