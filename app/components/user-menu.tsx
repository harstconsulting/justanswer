"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../lib/csrf-client";

type SessionResponse = {
  session: { userId: string; role: string } | null;
  user: {
    id: string;
    email: string;
    role: string;
    profile: { name?: string | null; avatarUrl?: string | null } | null;
  } | null;
};

export default function UserMenu() {
  const [data, setData] = useState<SessionResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data?.session || !data.user) {
    return (
      <div style={{ display: "flex", gap: 10 }}>
        <a className="button secondary" href="/auth/login">Login</a>
        <a className="button" href="/auth/register">Frage stellen</a>
      </div>
    );
  }

  const name = data.user.profile?.name || data.user.email;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role = data.user.role;
  const menuItems = role === "admin" || role === "superadmin"
    ? [
        { href: "/admin/users", label: "Admin Dashboard" },
        { href: "/admin/experts", label: "Experten" },
        { href: "/admin/cases", label: "Cases" },
        { href: "/account/settings", label: "Kontoeinstellungen" }
      ]
    : role === "expert"
      ? [
          { href: "/expert", label: "Expert Portal" },
          { href: "/expert/profile", label: "Profil" },
          { href: "/expert/notifications", label: "Benachrichtigungen" },
          { href: "/account/settings", label: "Kontoeinstellungen" }
        ]
      : [
          { href: "/app", label: "Dashboard" },
          { href: "/app/notifications", label: "Benachrichtigungen" },
          { href: "/account/settings", label: "Kontoeinstellungen" }
        ];

  async function logout() {
    const csrf = getCsrfToken();
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({})
    });
    window.location.href = "/";
  }

  return (
    <div className="user-menu">
      <button className="user-button" onClick={() => setOpen((v) => !v)}>
        {data.user.profile?.avatarUrl ? (
          <img className="avatar" src={data.user.profile.avatarUrl} alt="avatar" />
        ) : (
          <span className="avatar-fallback">{initials}</span>
        )}
      </button>
      {open ? (
        <div className="menu-panel">
          <div className="menu-header">
            <div className="menu-name">{name}</div>
            <div className="small">{data.user.email}</div>
          </div>
          <div className="menu-items">
            {menuItems.map((item) => (
              <a key={item.href} href={item.href} className="menu-item">{item.label}</a>
            ))}
            <button className="menu-item" onClick={logout}>Logout</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
