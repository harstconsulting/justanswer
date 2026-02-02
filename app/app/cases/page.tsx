"use client";

import { useEffect, useState } from "react";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/cases")
      .then((res) => res.json())
      .then((data) => setCases(data.cases || []));
  }, []);

  return (
    <div className="container">
      <h1>Meine Fälle</h1>
      <div className="grid-3">
        {cases.map((c) => (
          <a className="card" key={c.id} href={`/app/cases/${c.id}`}>
            <span className="status">{c.status}</span>
            <h3>{c.title}</h3>
            <p className="small">{c.category?.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
