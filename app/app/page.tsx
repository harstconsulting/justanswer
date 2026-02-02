export default function AppDashboard() {
  return (
    <div className="container">
      <h1>Customer Portal</h1>
      <div className="grid-3">
        <a className="card" href="/app/ask">
          <h3>Frage stellen</h3>
          <p className="small">Neue Frage erstellen und Matching starten.</p>
        </a>
        <a className="card" href="/app/cases">
          <h3>Meine Fälle</h3>
          <p className="small">Status, Chat und Verlauf.</p>
        </a>
        <a className="card" href="/app/notifications">
          <h3>Benachrichtigungen</h3>
          <p className="small">Neuigkeiten zu Fällen & Antworten.</p>
        </a>
      </div>
    </div>
  );
}
