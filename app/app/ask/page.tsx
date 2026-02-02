"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

type Category = { id: string; name: string };

export default function AskPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      categoryId: form.get("categoryId"),
      title: form.get("title"),
      description: form.get("description"),
      priority: form.get("priority")
    };

    const csrf = getCsrfToken();
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      setStatus(`Fall erstellt: ${data.caseId}`);
      formEl.reset();
    } else {
      setStatus("Fehler beim Erstellen.");
    }
  }

  return (
    <div className="container">
      <h1>Frage stellen</h1>
      <form className="form" onSubmit={onSubmit}>
        <select name="categoryId" required>
          <option value="">Kategorie wählen</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input className="input" name="title" placeholder="Titel" required />
        <textarea name="description" rows={5} placeholder="Beschreibung" required />
        <select name="priority" defaultValue="normal">
          <option value="normal">Normal</option>
          <option value="high">Hoch</option>
        </select>
        <label className="small">
          <input type="checkbox" required /> Kein Notfall / ersetzt keinen Arzt/Anwalt
        </label>
        <button className="button" type="submit">Absenden</button>
        {status ? <p className="small">{status}</p> : null}
      </form>
    </div>
  );
}
