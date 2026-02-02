export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <div>
          <span className="badge">Antwort in Minuten</span>
          <h1>Verifizierte Experten. 24/7 Chat. Lösung in einem Flow.</h1>
          <p className="small">
            Stelle eine Frage, werde automatisch gematcht und chatte bis zur Lösung. Transparent, sicher und schnell.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <a className="button" href="/auth/register">Jetzt Frage stellen</a>
            <a className="button secondary" href="/how-it-works">So funktioniert's</a>
          </div>
        </div>
        <div className="card">
          <h3>Live Status</h3>
          <p className="small">Wartet auf Experten → Experte verbunden → Beantwortet → Geschlossen</p>
          <div className="grid-3">
            <div className="card">
              <div className="status">⏱️ Wartet</div>
              <p className="small">Matching startet sofort nach Absenden.</p>
            </div>
            <div className="card">
              <div className="status">💬 Verbunden</div>
              <p className="small">Echte Chat-Unterhaltung inkl. Anhänge.</p>
            </div>
            <div className="card">
              <div className="status">✅ Gelöst</div>
              <p className="small">Bewerten und Fall schließen.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-3">
        {[
          "Recht",
          "Medizin",
          "Technik",
          "Auto",
          "Steuern",
          "Haushalt"
        ].map((cat) => (
          <div className="card" key={cat}>
            <h3>{cat}</h3>
            <p className="small">Verifizierte Experten, schnelle Antwortzeiten.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
