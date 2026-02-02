"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

export default function ExpertVerificationPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");

  async function load() {
    const res = await fetch("/api/expert/verification");
    const data = await res.json();
    setDocuments(data.documents || []);
    setVerificationStatus(data.verificationStatus || "pending");
  }

  useEffect(() => {
    load();
  }, []);

  async function addDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const form = new FormData(e.currentTarget);
    const payload = { fileUrl: form.get("fileUrl") };
    const csrf = getCsrfToken();

    const res = await fetch("/api/expert/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setStatus("Dokument hinzugefügt.");
      e.currentTarget.reset();
      load();
    } else {
      setStatus("Upload fehlgeschlagen.");
    }
  }

  return (
    <div className="container">
      <h1>Verifizierung</h1>
      <p className="small">Status: {verificationStatus}</p>
      <form className="form" onSubmit={addDocument}>
        <input className="input" name="fileUrl" placeholder="Dokument URL" required />
        <button className="button" type="submit">Dokument hinzufügen</button>
      </form>
      {status ? <p className="small">{status}</p> : null}
      <div className="grid-3" style={{ marginTop: 16 }}>
        {documents.map((doc) => (
          <div className="card" key={doc.id}>
            <p className="small">{doc.fileUrl}</p>
            <span className="status">{doc.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
