"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
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

    if (res.ok) {
      const data = await res.json();
      if (data.role === "admin" || data.role === "superadmin") {
        router.push("/admin/users");
      } else {
        setError("Kein Admin-Konto.");
      }
    } else {
      setError("Login fehlgeschlagen.");
    }
  }

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" name="email" type="email" placeholder="E-Mail" required />
        <input className="input" name="password" type="password" placeholder="Passwort" required />
        {error ? <p className="small" style={{ color: "var(--danger)" }}>{error}</p> : null}
        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
}
