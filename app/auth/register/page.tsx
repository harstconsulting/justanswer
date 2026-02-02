"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function RegisterPage() {
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
      password: form.get("password"),
      role: form.get("role")
    };

    const csrf = getCsrfToken();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("Registrierung fehlgeschlagen.");
      return;
    }

    const data = await res.json();
    if (data.role === "expert") {
      router.push("/expert/profile");
    } else {
      router.push("/app");
    }
  }

  return (
    <div className="container">
      <h1>Registrieren</h1>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" name="email" type="email" placeholder="E-Mail" required />
        <input className="input" name="password" type="password" placeholder="Passwort (min. 8)" required />
        <select name="role" defaultValue="customer">
          <option value="customer">Ich habe eine Frage</option>
          <option value="expert">Ich bin Experte</option>
        </select>
        {error ? <p className="small" style={{ color: "var(--danger)" }}>{error}</p> : null}
        <button className="button" disabled={loading} type="submit">{loading ? "..." : "Registrieren"}</button>
      </form>
    </div>
  );
}
