"use client";

import { useEffect, useState } from "react";

export default function AdminCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assignedExpertId, setAssignedExpertId] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (assignedExpertId) params.set("assignedExpertId", assignedExpertId);
    const res = await fetch(`/api/admin/cases?${params.toString()}`);
    const data = await res.json();
    setCases(data.cases || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container">
      <h1>Admin · Cases</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <input className="input" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" />
        <input className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="Category ID" />
        <input className="input" value={assignedExpertId} onChange={(e) => setAssignedExpertId(e.target.value)} placeholder="Expert ID" />
        <button className="button" onClick={load}>Filtern</button>
      </div>
      <div className="grid-3">
        {cases.map((c) => (
          <a className="card" key={c.id} href={`/admin/cases/${c.id}`}>
            <span className="status">{c.status}</span>
            <h3>{c.title}</h3>
            <p className="small">{c.category?.name}</p>
            <p className="small">Kunde: {c.customer?.email}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
