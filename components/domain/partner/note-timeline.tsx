"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { markNoteAsRead } from "@/app/(app)/partner/actions";
import { cn } from "@/lib/utils";

interface PartnerNote {
  id: string;
  kind: "gratitude" | "bother" | "request" | "celebrate";
  content: string;
  author_id: string;
  is_read: boolean;
  created_at: string;
  profiles?: { display_name: string } | null;
}

interface NoteTimelineProps {
  notes: PartnerNote[];
  currentUserId: string;
}

const KIND_STYLES = {
  gratitude: {
    emoji: "💚",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    unreadBorder: "border-emerald-400 dark:border-emerald-600",
  },
  bother: {
    emoji: "🟡",
    bg: "bg-amber-50/60 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    unreadBorder: "border-amber-400 dark:border-amber-600",
  },
  request: {
    emoji: "🔵",
    bg: "bg-blue-50/60 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    unreadBorder: "border-blue-400 dark:border-blue-600",
  },
  celebrate: {
    emoji: "🎉",
    bg: "bg-purple-50/60 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    unreadBorder: "border-purple-400 dark:border-purple-600",
  },
} as const;

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "právě teď";
  if (diffMin < 60) return `před ${diffMin} min`;
  if (diffHours < 24) return `před ${diffHours}h`;
  if (diffDays === 1) return "včera";
  if (diffDays < 7) return `před ${diffDays} dny`;
  return date.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}

export function NoteTimeline({ notes, currentUserId }: NoteTimelineProps) {
  // Mark unread notes from partner as read
  useEffect(() => {
    const unreadFromPartner = notes.filter(
      (n) => !n.is_read && n.author_id !== currentUserId,
    );
    for (const note of unreadFromPartner) {
      markNoteAsRead(note.id);
    }
  }, [notes, currentUserId]);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle
          size={40}
          className="text-muted-foreground/20 mb-3"
        />
        <p className="text-sm font-medium text-muted-foreground">
          Zatím žádné vzkazy. Pošli první!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isMine = note.author_id === currentUserId;
        const style = KIND_STYLES[note.kind];
        const isUnread = !note.is_read && !isMine;
        const authorName =
          note.profiles?.display_name ?? (isMine ? "Ty" : "Partner");

        return (
          <div
            key={note.id}
            className={cn(
              "flex",
              isMine ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] sm:max-w-[70%] rounded-2xl border-2 p-3 transition-colors",
                style.bg,
                isUnread ? style.unreadBorder : style.border,
                isMine ? "rounded-br-md" : "rounded-bl-md",
                isUnread && "shadow-sm",
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">{style.emoji}</span>
                <span className="text-xs font-medium text-foreground/70">
                  {authorName}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {getRelativeTime(note.created_at)}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>

              {/* Unread indicator */}
              {isUnread && (
                <div className="flex justify-end mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
