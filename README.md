# Expert Q&A Marketplace (MVP)

Produktionsbereite MVP-Architektur für einen Expert Q&A Marketplace ähnlich JustAnswer.

## Stack
- Next.js (App Router)
- PostgreSQL + Prisma
- SSE für Realtime-Chat (MVP)
- JWT Cookie Sessions

## Setup
1) `.env` erstellen:

```bash
cp .env.example .env
```

2) Postgres starten:

```bash
docker-compose up -d
```

3) Abhängigkeiten installieren:

```bash
npm install
```

4) Prisma Client generieren + Migration anwenden + Seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5) Dev starten:

```bash
npm run dev
```

## Local without Docker
- Starte Postgres lokal (oder via Docker Compose) und setze `DATABASE_URL` auf `localhost`.
- Prisma Migrate/Seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Local with Docker Compose
- Postgres läuft über `docker-compose.yml` (Service `db`), Next.js läuft lokal.
- `DATABASE_URL` bleibt `postgresql://...@localhost:5432/...` (Host-Mapping).

```bash
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
```

## Production
- Wenn Next.js in einem Container läuft, `DATABASE_URL` muss auf den DB-Service zeigen (z.B. `db`), nicht `localhost`.
- Setze `APP_URL` auf die öffentliche URL (z.B. https://example.com).

## Seed
- Admin: `admin@example.com` / `Admin1234!`
- Kategorien: Recht, Medizin, Technik, Auto, Steuern, Immobilien, Haushalt, Business

## Realtime
Chat nutzt Server-Sent Events (`/api/cases/[id]/stream`) und einen In-Memory EventEmitter. Für Production: Redis Pub/Sub oder WebSocket Gateway ersetzen.

## Sicherheit (MVP)
- Passwort Hashing: bcrypt
- Session: HttpOnly Cookie + JWT (HS256)
- Double-Submit CSRF Token (Cookie `csrf` + Header `x-csrf-token` auf POST/PUT/PATCH/DELETE)
- RBAC Checks serverseitig
- Atomic Claim für Experten (optimistisch, 409 bei Konkurrenz)
- Input Validation via Zod
- Audit Logs für Admin Actions
- Uploads als Stub (Sign-URL Platzhalter)
- Security Headers via `middleware.ts` (HSTS, CSP, XFO, XCTO, Referrer-Policy)
- E-Mail wird beim Login/Signup normalisiert (lowercase)

### CSRF im Frontend
Für state-changing Requests muss der Header gesetzt werden:

```ts
const token = document.cookie.match(/(?:^|; )csrf=([^;]+)/)?.[1];
await fetch("/api/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-csrf-token": token ?? "" },
  body: JSON.stringify(payload)
});
```

### Rate Limits (MVP)
- `/api/auth/login`, `/api/auth/register`: 10 / Minute pro IP
- `/api/cases/[id]/messages`: 30 / Minute pro User
- In Produktion: Redis (INCR + EXPIRE) statt In-Memory Map verwenden

## SMTP / Email (All-Inkl)
ENV-Variablen (keine Secrets committen):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `SUPPORT_EMAIL` optional

Hinweis:
- Port 587 = STARTTLS (`SMTP_SECURE=false`)
- Port 465 = SSL (`SMTP_SECURE=true`)

## Tests
```bash
npm test
```

## Deployment
- `docker-compose.yml` liefert Postgres
- Next.js kann in Docker ergänzt werden (optional)
