"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password")
    };

    const csrf = getCsrfToken();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("Login fehlgeschlagen.");
      return;
    }

    const data = await res.json();
    if (data.role === "expert") {
      router.push("/expert");
    } else if (data.role === "admin" || data.role === "superadmin") {
      router.push("/admin/users");
    } else {
      router.push("/app");
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" name="email" type="email" placeholder="E-Mail" required />
        <input className="input" name="password" type="password" placeholder="Passwort" required />
        {error ? <p className="small" style={{ color: "var(--danger)" }}>{error}</p> : null}
        <button className="button" disabled={loading} type="submit">{loading ? "..." : "Login"}</button>
      </form>
    </div>
  );
}
