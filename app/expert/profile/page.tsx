"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../lib/csrf-client";

type Category = { id: string; name: string };

export default function ExpertProfilePage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const [profileRes, categoriesRes] = await Promise.all([
        fetch("/api/expert/profile"),
        fetch("/api/categories")
      ]);
      const profileData = await profileRes.json();
      const categoriesData = await categoriesRes.json();
      setUser(profileData.user);
      setSkills(profileData.user?.expert?.skills || []);
      setCategories(categoriesData.categories || []);
      setAvatarUrl(profileData.user?.profile?.avatarUrl ?? "");
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      bio: form.get("bio"),
      name: form.get("name"),
      phone: form.get("phone"),
      locale: form.get("locale"),
      avatarUrl: avatarUrl || form.get("avatarUrl")
    };

    const csrf = getCsrfToken();
    const res = await fetch("/api/expert/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setMessage("Profil gespeichert.");
    } else {
      setMessage("Speichern fehlgeschlagen.");
    }
  }

  function updateSkill(index: number, field: string, value: string | number) {
    setSkills((prev) =>
      prev.map((skill, i) => (i === index ? { ...skill, [field]: value } : skill))
    );
  }

  function addSkill() {
    setSkills((prev) => [...prev, { categoryId: "", proficiencyLevel: 3 }]);
  }

  function removeSkill(index: number) {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveSkills() {
    setMessage(null);
    const payload = skills
      .filter((s) => s.categoryId)
      .map((s) => ({ categoryId: s.categoryId, proficiencyLevel: Number(s.proficiencyLevel) }));

    const csrf = getCsrfToken();
    const res = await fetch("/api/expert/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      setSkills(data.skills || []);
      setMessage("Skills gespeichert.");
    } else {
      setMessage("Skills speichern fehlgeschlagen.");
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    const csrf = getCsrfToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "x-csrf-token": csrf ?? "" },
      body: form
    });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setAvatarUrl(data.fileUrl);
    } else {
      setMessage("Avatar Upload fehlgeschlagen.");
    }
  }

  if (loading) return <div className="container">Lade...</div>;

  return (
    <div className="container">
      <h1>Expert Profil</h1>
      <form className="form" onSubmit={saveProfile}>
        <input className="input" name="name" defaultValue={user?.profile?.name ?? ""} placeholder="Anzeigename" />
        <input className="input" name="phone" defaultValue={user?.profile?.phone ?? ""} placeholder="Telefon (optional)" />
        <input className="input" name="locale" defaultValue={user?.profile?.locale ?? "de"} placeholder="Locale" />
        <input
          className="input"
          name="avatarUrl"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Avatar URL (optional)"
        />
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadAvatar(file);
          }}
        />
        {uploading ? <p className="small">Uploading...</p> : null}
        <textarea name="bio" rows={5} defaultValue={user?.expert?.bio ?? ""} placeholder="Bio" />
        <button className="button" type="submit">Profil speichern</button>
      </form>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Skills</h3>
        {skills.map((skill, index) => (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px", gap: 12, marginBottom: 8 }}>
            <select
              value={skill.categoryId || ""}
              onChange={(e) => updateSkill(index, "categoryId", e.target.value)}
            >
              <option value="">Kategorie wählen</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              min={1}
              max={5}
              value={skill.proficiencyLevel ?? 3}
              onChange={(e) => updateSkill(index, "proficiencyLevel", Number(e.target.value))}
            />
            <button className="button secondary" type="button" onClick={() => removeSkill(index)}>Entfernen</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button className="button secondary" type="button" onClick={addSkill}>Skill hinzufügen</button>
          <button className="button" type="button" onClick={saveSkills}>Skills speichern</button>
        </div>
      </div>

      {message ? <p className="small" style={{ marginTop: 16 }}>{message}</p> : null}
    </div>
  );
}
