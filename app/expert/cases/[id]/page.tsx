"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCsrfToken } from "../../../../lib/csrf-client";

export default function ExpertCaseDetail() {
  const params = useParams();
  const caseId = params?.id as string;
  const [caseRecord, setCaseRecord] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!caseId) return;
    fetch(`/api/cases/${caseId}`)
      .then((res) => res.json())
      .then((data) => setCaseRecord(data.case));

    fetch(`/api/cases/${caseId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, [caseId]);

  async function sendMessage() {
    if (!input.trim()) return;
    const csrf = getCsrfToken();
    await fetch(`/api/cases/${caseId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ content: input, type: "text" })
    });
    setInput("");
  }

  async function markAnswered() {
    const csrf = getCsrfToken();
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({ status: "answered" })
    });
    setCaseRecord((prev: any) => ({ ...prev, status: "answered" }));
  }

  return (
    <div className="container">
      <h1>Fall</h1>
      {caseRecord ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <span className="status">{caseRecord.status}</span>
          <h3>{caseRecord.title}</h3>
          <p className="small">{caseRecord.description}</p>
          <button className="button secondary" onClick={markAnswered}>Als gelöst markieren</button>
        </div>
      ) : null}
      <div className="chat">
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id || Math.random()} className="card">
              <div className="small">{m.type}</div>
              <div>{m.content}</div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <textarea rows={3} value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="button" onClick={sendMessage}>Senden</button>
        </div>
      </div>
    </div>
  );
}
