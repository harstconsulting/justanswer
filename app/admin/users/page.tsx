"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
  }, []);

  return (
    <div className="container">
      <h1>Admin · Users</h1>
      <div className="grid-3">
        {users.map((u) => (
          <div className="card" key={u.id}>
            <span className="tag">{u.role}</span>
            <h3>{u.email}</h3>
            <p className="small">Status: {u.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
