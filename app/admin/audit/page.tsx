"use client";

import { useEffect, useState } from "react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (actor) params.set("actor", actor);
    if (action) params.set("action", action);
    if (targetType) params.set("target_type", targetType);
    const res = await fetch(`/api/admin/audit?${params.toString()}`);
    const data = await res.json();
    setLogs(data.logs || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container">
      <h1>Admin · Audit Log</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <input className="input" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Actor User ID" />
        <input className="input" value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action" />
        <input className="input" value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="Target Type" />
        <button className="button" onClick={load}>Filtern</button>
      </div>
      <div className="grid-3">
        {logs.map((log) => (
          <div className="card" key={log.id}>
            <p className="small">{log.action}</p>
            <p className="small">Actor: {log.actorUserId}</p>
            <p className="small">Target: {log.targetType} · {log.targetId}</p>
            <p className="small">{log.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
