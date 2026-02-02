"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function ExpertQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/expert/queue");
    const data = await res.json();
    setCases(data.cases || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function claim(caseId: string) {
    const csrf = getCsrfToken();
    const res = await fetch("/api/expert/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ caseId })
    });
    if (res.ok) {
      setMessage("Fall übernommen.");
      load();
    } else {
      setMessage("Claim fehlgeschlagen.");
    }
  }

  return (
    <div className="container">
      <h1>Queue</h1>
      {message ? <p className="small">{message}</p> : null}
      <div className="grid-3">
        {cases.map((c) => (
          <div className="card" key={c.id}>
            <span className="status">{c.priority}</span>
            <h3>{c.title}</h3>
            <p className="small">{c.category?.name}</p>
            <button className="button" onClick={() => claim(c.id)}>Claim</button>
          </div>
        ))}
      </div>
    </div>
  );
}
