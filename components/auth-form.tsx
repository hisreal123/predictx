"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/password-input";
import { PasswordStrength } from "@/components/password-strength";
import { useLogin, useRegister } from "@/lib/api/hooks";
import { assessPassword } from "@/lib/password";
import type { ApiError } from "@/lib/api/client";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="animate-rise text-[12px] text-destructive">{message}</p>;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const login = useLogin({ onSuccess: () => router.push("/") });
  const register = useRegister({ onSuccess: () => router.push("/") });
  const mutation = isRegister ? register : login;
  const error = mutation.error as ApiError | null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const strength = assessPassword(form.password);
  // Blocking must not depend on blur: someone can type a mismatched
  // confirmation and hit submit without the field ever losing focus.
  const mismatch =
    isRegister &&
    form.password_confirmation.length > 0 &&
    form.password !== form.password_confirmation;
  // The message, though, waits for blur so it doesn't scold mid-typing.
  const showMismatch = mismatch && touchedConfirm;

  // Only registration enforces the policy — applying it at login would lock
  // out anyone whose existing password predates these rules.
  const blocked = isRegister && (!strength.valid || mismatch);

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (blocked) return;
    if (isRegister) {
      register.mutate(form);
    } else {
      login.mutate({ email: form.email, password: form.password });
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm py-6">
      <div className="animate-rise">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {isRegister
            ? "Save predictions, unlock ratings and track your picks."
            : "Sign in to pick up where you left off."}
        </p>
      </div>

      {error && Object.keys(error.errors).length === 0 && (
        <Alert variant="destructive" className="mt-5 animate-rise">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="stagger mt-6 space-y-4">
        {isRegister && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={update("name")}
              autoComplete="name"
              required
            />
            <FieldError message={error?.fieldError("name")} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
            required
          />
          <FieldError message={error?.fieldError("email")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={update("password")}
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
          <FieldError message={error?.fieldError("password")} />
          {isRegister && form.password.length > 0 && (
            <PasswordStrength value={form.password} />
          )}
        </div>

        {isRegister && (
          <div className="space-y-1.5">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <PasswordInput
              id="password_confirmation"
              value={form.password_confirmation}
              onChange={update("password_confirmation")}
              onBlur={() => setTouchedConfirm(true)}
              autoComplete="new-password"
              aria-invalid={showMismatch || undefined}
              required
            />
            <FieldError
              message={
                showMismatch
                  ? "Passwords don't match"
                  : error?.fieldError("password_confirmation")
              }
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending || blocked}
        >
          {mutation.isPending && (
            <Loader2Icon className="animate-spin-fast" aria-hidden />
          )}
          {mutation.isPending
            ? isRegister
              ? "Creating account…"
              : "Signing in…"
            : isRegister
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        {isRegister ? "Already have an account? " : "New to PredictX? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {isRegister ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
