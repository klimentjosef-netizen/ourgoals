"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-heading text-lg font-bold tracking-tight">
            <span className="text-primary">Our</span>Goals
          </span>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Začít zdarma
          </Link>
        </div>
      </div>
    </header>
  );
}

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
