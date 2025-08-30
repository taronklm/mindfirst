"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

async function postJSON<T>(url: string, body: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json?.error || "Error" };
  return { ok: true, data: json };
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!accept) {
      setError("Bitte akzeptiere die Bedingungen.");
      return;
    }
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    setLoading(true);
    const res = await postJSON<{ ok: boolean; id: string }>("/api/auth/signup", { name, email, password });
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Registrierung fehlgeschlagen.");
      return;
    }

    setSuccess("Konto angelegt. Du kannst dich jetzt anmelden.");
    setTimeout(() => router.push("/login"), 800);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Erstelle dein Konto für den Prototypen</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Max Mustermann" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              {/* fix: id Tippfehler war passowrd */}
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="terms" checked={accept} onCheckedChange={(v) => setAccept(Boolean(v))} />
              <Label htmlFor="terms">Bedingungen akzeptieren</Label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird erstellt..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
