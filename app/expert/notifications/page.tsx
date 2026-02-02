"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function ExpertNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnread(data.unreadCount || 0);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    const csrf = getCsrfToken();
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({})
    });
    load();
  }

  return (
    <div className="container">
      <h1>Benachrichtigungen</h1>
      <p className="small">Ungelesen: {unread}</p>
      <button className="button secondary" onClick={markAllRead}>Alle als gelesen markieren</button>
      <div className="grid-3" style={{ marginTop: 16 }}>
        {notifications.map((n) => (
          <div className="card" key={n.id}>
            <span className="tag">{n.type}</span>
            <p className="small">{JSON.stringify(n.payloadJson)}</p>
            <p className="small">{n.readAt ? "Gelesen" : "Ungelesen"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
