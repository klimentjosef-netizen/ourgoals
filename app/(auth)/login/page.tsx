"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "magic" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Odkaz pro reset hesla odeslán na email.");
      }
      setLoading(false);
      return;
    }

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Odkaz odeslán na email. Zkontroluj schránku.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    }

    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Účet vytvořen. Ověř email a přihlaš se.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">OurGoals</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Přihlaš se. Začni plnit.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode === "login" && (
              <Input
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "..."
                : mode === "reset"
                  ? "Odeslat odkaz pro reset"
                  : mode === "magic"
                    ? "Poslat magic link"
                    : "Přihlásit se"}
            </Button>

            {mode === "login" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={handleSignup}
              >
                Vytvořit účet
              </Button>
            )}
          </form>

          <div className="mt-4 text-center space-y-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono block mx-auto"
              onClick={() => setMode(mode === "login" ? "magic" : "login")}
            >
              {mode === "login"
                ? "→ Přihlásit se přes magic link"
                : "→ Přihlásit se heslem"}
            </button>
            {mode === "login" && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono block mx-auto"
                onClick={() => setMode("reset")}
              >
                Zapomněl jsi heslo?
              </button>
            )}
            {mode === "reset" && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono block mx-auto"
                onClick={() => setMode("login")}
              >
                ← Zpět na přihlášení
              </button>
            )}
          </div>

          {message && (
            <p className="mt-4 text-sm text-center text-muted-foreground font-mono">
              {message}
            </p>
          )}

          {DEV_MODE && (
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={() => window.location.href = "/dashboard"}
              >
                Přeskočit přihlášení
                <ArrowRight size={16} />
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">
                Dev mode — prohlížení bez účtu
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
