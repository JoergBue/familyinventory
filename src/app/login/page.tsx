"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Anmeldung fehlgeschlagen");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1120] p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login-bg.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">MyFamily</h1>
          <p className="mt-1 text-sm text-slate-300">
            Verwaltung eurer Gegenstände
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="mb-4 text-lg font-semibold">Anmelden</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="password">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
