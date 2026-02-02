"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

type Category = { id: string; name: string; parentId?: string | null; isActive: boolean };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory() {
    const csrf = getCsrfToken();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ name, parentId: parentId || null })
    });
    setName("");
    setParentId("");
    load();
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    const csrf = getCsrfToken();
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ id, ...updates })
    });
    load();
  }

  return (
    <div className="container">
      <h1>Admin · Kategorien</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Neue Kategorie" />
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">Keine Parent-Kategorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="button" onClick={createCategory}>Anlegen</button>
      </div>
      <div className="grid-3">
        {categories.map((c) => (
          <div className="card" key={c.id}>
            <input
              className="input"
              defaultValue={c.name}
              onBlur={(e) => updateCategory(c.id, { name: e.target.value })}
            />
            <select
              defaultValue={c.parentId ?? ""}
              onChange={(e) => updateCategory(c.id, { parentId: e.target.value || null })}
            >
              <option value="">Keine Parent-Kategorie</option>
              {categories.filter((p) => p.id !== c.id).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                className="button secondary"
                onClick={() => updateCategory(c.id, { isActive: !c.isActive })}
              >
                {c.isActive ? "Deaktivieren" : "Aktivieren"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
