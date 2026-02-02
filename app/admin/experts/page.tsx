"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/experts");
    const data = await res.json();
    setExperts(data.experts || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(expertId: string, status: string) {
    const csrf = getCsrfToken();
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ expertId, status })
    });
    if (res.ok) {
      setMessage(`Status gesetzt: ${status}`);
      load();
    } else {
      setMessage("Aktion fehlgeschlagen.");
    }
  }

  return (
    <div className="container">
      <h1>Admin · Experts</h1>
      {message ? <p className="small">{message}</p> : null}
      <div className="grid-3">
        {experts.map((expert) => (
          <div className="card" key={expert.id}>
            <span className="tag">{expert.verificationStatus}</span>
            <h3>{expert.user?.profile?.name ?? expert.user?.email}</h3>
            <p className="small">{expert.user?.email}</p>
            <p className="small">Skills: {expert.skills?.length ?? 0}</p>
            <p className="small">Rating: {expert.ratingAvg} · Antworten: {expert.answeredCount}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <button className="button" onClick={() => updateStatus(expert.id, "verified")}>Verify</button>
              <button className="button secondary" onClick={() => updateStatus(expert.id, "rejected")}>Reject</button>
              <button className="button secondary" onClick={() => updateStatus(expert.id, "suspended")}>Suspend</button>
            </div>
            {expert.documents?.length ? (
              <div style={{ marginTop: 8 }}>
                <p className="small">Dokumente:</p>
                {expert.documents.map((doc: any) => (
                  <div key={doc.id} className="small">{doc.fileUrl} · {doc.status}</div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
