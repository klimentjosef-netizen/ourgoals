"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEV_MODE } from "@/lib/dev/mock-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

type AuthMode = "tabs" | "reset" | "magic";

function PasswordField({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  id,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-10 pr-10"
        disabled={disabled}
        required
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={onToggle}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [mode, setMode] = useState<AuthMode>("tabs");
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const supabase = createClient();

  const passwordValid = password.length >= 6;
  const passwordsMatch = password === passwordConfirm && passwordConfirm.length > 0;

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValid) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    if (!passwordsMatch) {
      setError("Hesla se neshodují.");
      return;
    }

    setLoading(true);
    clearMessages();

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSignupDone(true);
    }

    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Odkaz pro reset hesla odeslán na email.");
    }

    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Odkaz odeslán na email. Zkontroluj schránku.");
    }

    setLoading(false);
  }

  function switchToMode(newMode: AuthMode) {
    setMode(newMode);
    clearMessages();
  }

  // ── Shared UI pieces ──────────────────────────────────────────────

  function MessageDisplay() {
    if (!error && !success) return null;
    return (
      <div className="mt-4">
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </p>
        )}
      </div>
    );
  }

  // PasswordInput moved outside component as PasswordField to prevent re-render focus loss

  // EmailInput inlined to prevent re-render focus loss
  const emailInput = (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 pl-10"
        disabled={loading}
        required
      />
    </div>
  );

  function SubmitButton({ children }: { children: React.ReactNode }) {
    return (
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </Button>
    );
  }

  // ── Signup success screen ─────────────────────────────────────────

  if (signupDone) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Účet vytvořen!</h2>
          <p className="text-muted-foreground">
            Zkontroluj email a klikni na potvrzovací odkaz.
          </p>
          <Button
            className="h-11 mt-4"
            onClick={() => {
              setSignupDone(false);
              setMode("tabs");
              setActiveTab("login");
              setPassword("");
              setPasswordConfirm("");
              clearMessages();
            }}
          >
            Přihlásit se
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // ── Reset mode ────────────────────────────────────────────────────

  if (mode === "reset") {
    return (
      <PageWrapper>
        <BackToHome />
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Obnovení hesla</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Zadej svůj email a pošleme ti odkaz pro reset hesla.
          </p>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {emailInput}
          </div>
          <SubmitButton>Odeslat odkaz pro reset</SubmitButton>
        </form>
        <MessageDisplay />
        <button
          type="button"
          className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          onClick={() => switchToMode("tabs")}
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na přihlášení
        </button>
        <DevModeSection />
      </PageWrapper>
    );
  }

  // ── Magic link mode ───────────────────────────────────────────────

  if (mode === "magic") {
    return (
      <PageWrapper>
        <BackToHome />
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Magic link</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pošleme ti přihlašovací odkaz na email. Bez hesla.
          </p>
        </div>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {emailInput}
          </div>
          <SubmitButton>Poslat magic link</SubmitButton>
        </form>
        <MessageDisplay />
        <button
          type="button"
          className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          onClick={() => switchToMode("tabs")}
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na přihlášení
        </button>
        <DevModeSection />
      </PageWrapper>
    );
  }

  // ── Default: Tabs (Login / Register) ──────────────────────────────

  return (
    <PageWrapper>
      <BackToHome />

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          clearMessages();
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Přihlášení</TabsTrigger>
          <TabsTrigger value="register">Registrace</TabsTrigger>
        </TabsList>

        {/* ── Login tab ─────────────────────── */}
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {emailInput}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <PasswordField
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Heslo"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                disabled={loading}
              />
            </div>
            <SubmitButton>Přihlásit se</SubmitButton>
          </form>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
              onClick={() => switchToMode("reset")}
            >
              Zapomněl jsi heslo?
            </button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
              onClick={() => switchToMode("magic")}
            >
              Přihlásit se přes magic link
            </button>
          </div>
        </TabsContent>

        {/* ── Register tab ──────────────────── */}
        <TabsContent value="register">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {emailInput}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <PasswordField
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Heslo"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                disabled={loading}
              />
              {password.length > 0 && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  {passwordValid ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className={passwordValid ? "text-green-600" : "text-red-500"}>
                    Min. 6 znaků
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-confirm">Potvrzení hesla</Label>
              <PasswordField
                id="password-confirm"
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                placeholder="Heslo znovu"
                show={showPasswordConfirm}
                onToggle={() => setShowPasswordConfirm(!showPasswordConfirm)}
                disabled={loading}
              />
              {passwordConfirm.length > 0 && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  {passwordsMatch ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className={passwordsMatch ? "text-green-600" : "text-red-500"}>
                    {passwordsMatch ? "Hesla se shodují" : "Hesla se neshodují"}
                  </span>
                </div>
              )}
            </div>
            <SubmitButton>Vytvořit účet</SubmitButton>
          </form>
        </TabsContent>
      </Tabs>

      <MessageDisplay />
      <DevModeSection />
    </PageWrapper>
  );
}

// ── Layout components ────────────────────────────────────────────────

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary/5 to-primary/10 flex-col justify-center px-12 lg:px-16">
        <div className="max-w-md mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-primary">OurGoals</h1>
          <p className="text-xl font-semibold text-foreground/90">
            Tvůj osobní systém pro lepší život.
          </p>
          <ul className="space-y-4">
            {[
              "Cíle, návyky a gamifikace na jednom místě",
              "7 modulů: vyber jen to, co potřebuješ",
              "XP, levely a streak tě udrží v motivaci",
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-none md:border md:shadow-sm">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function BackToHome() {
  return (
    <a
      href="/"
      className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Zpět
    </a>
  );
}

function DevModeSection() {
  if (!DEV_MODE) return null;
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <Button
        type="button"
        variant="default"
        className="w-full"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Přeskočit přihlášení
        <ArrowRight size={16} />
      </Button>
      <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">
        Dev mode – prohlížení bez účtu
      </p>
    </div>
  );
}
