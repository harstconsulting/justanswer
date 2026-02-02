export default function ExpertDashboard() {
  return (
    <div className="container">
      <h1>Expert Portal</h1>
      <div className="grid-3">
        <a className="card" href="/expert/queue">
          <h3>Queue</h3>
          <p className="small">Neue passende Fragen.</p>
        </a>
        <a className="card" href="/expert/notifications">
          <h3>Benachrichtigungen</h3>
          <p className="small">Neue Cases & Updates.</p>
        </a>
        <a className="card" href="/expert/profile">
          <h3>Profil</h3>
          <p className="small">Bio, Skills, Sprachen.</p>
        </a>
        <a className="card" href="/expert/verification">
          <h3>Verifizierung</h3>
          <p className="small">Dokumente hochladen (Stub).</p>
        </a>
      </div>
    </div>
  );
}
