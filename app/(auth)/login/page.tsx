"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "magic">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
              onClick={() => setMode(mode === "login" ? "magic" : "login")}
            >
              {mode === "login"
                ? "→ Přihlásit se přes magic link"
                : "→ Přihlásit se heslem"}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-center text-muted-foreground font-mono">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
