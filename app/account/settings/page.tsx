"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      locale: form.get("locale"),
      avatarUrl: form.get("avatarUrl")
    };

    const csrf = getCsrfToken();
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setMessage("Profil gespeichert.");
    } else {
      setMessage("Speichern fehlgeschlagen.");
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMessage(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      currentPassword: form.get("currentPassword"),
      newPassword: form.get("newPassword")
    };

    const csrf = getCsrfToken();
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setPwMessage("Passwort geändert.");
      e.currentTarget.reset();
    } else {
      setPwMessage("Passwort ändern fehlgeschlagen.");
    }
  }

  return (
    <div className="container">
      <h1>Kontoeinstellungen</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Profil</h3>
        <form className="form" onSubmit={saveProfile}>
          <input className="input" name="name" defaultValue={user?.profile?.name ?? ""} placeholder="Name" />
          <input className="input" name="phone" defaultValue={user?.profile?.phone ?? ""} placeholder="Telefon" />
          <input className="input" name="locale" defaultValue={user?.profile?.locale ?? "de"} placeholder="Locale" />
          <input className="input" name="avatarUrl" defaultValue={user?.profile?.avatarUrl ?? ""} placeholder="Avatar URL" />
          <button className="button" type="submit">Speichern</button>
        </form>
        {message ? <p className="small">{message}</p> : null}
      </div>

      <div className="card">
        <h3>Passwort ändern</h3>
        <form className="form" onSubmit={changePassword}>
          <input className="input" name="currentPassword" type="password" placeholder="Aktuelles Passwort" required />
          <input className="input" name="newPassword" type="password" placeholder="Neues Passwort" required />
          <button className="button" type="submit">Passwort ändern</button>
        </form>
        {pwMessage ? <p className="small">{pwMessage}</p> : null}
      </div>
    </div>
  );
}
