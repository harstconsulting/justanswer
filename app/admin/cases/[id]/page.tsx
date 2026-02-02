"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCsrfToken } from "../../../../lib/csrf-client";

export default function AdminCaseDetail() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseRecord, setCaseRecord] = useState<any | null>(null);
  const [expertId, setExpertId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/cases/${caseId}`);
    const data = await res.json();
    setCaseRecord(data.case);
  }

  useEffect(() => {
    if (caseId) load();
  }, [caseId]);

  async function assign() {
    const csrf = getCsrfToken();
    const res = await fetch(`/api/admin/cases/${caseId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ expertId })
    });
    if (res.ok) {
      setMessage("Neu zugewiesen.");
      load();
    } else {
      setMessage("Zuweisung fehlgeschlagen.");
    }
  }

  if (!caseRecord) return <div className="container">Lade...</div>;

  return (
    <div className="container">
      <h1>Case Detail</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <span className="status">{caseRecord.status}</span>
        <h3>{caseRecord.title}</h3>
        <p className="small">{caseRecord.description}</p>
        <p className="small">Kunde: {caseRecord.customer?.email}</p>
        <p className="small">Experte: {caseRecord.assignedExpert?.email ?? "-"}</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Reassign Expert</h3>
        <input className="input" value={expertId} onChange={(e) => setExpertId(e.target.value)} placeholder="Expert User ID" />
        <button className="button" onClick={assign}>Zuweisen</button>
        {message ? <p className="small">{message}</p> : null}
      </div>

      <div className="card">
        <h3>Messages</h3>
        {caseRecord.messages?.map((m: any) => (
          <div key={m.id} className="small" style={{ marginBottom: 8 }}>
            {m.createdAt} · {m.type} · {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}
