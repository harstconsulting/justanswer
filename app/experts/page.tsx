const experts = [
  { name: "Dr. Lina Berger", rating: 4.9, answers: 1240 },
  { name: "Maximilian Roth", rating: 4.7, answers: 860 },
  { name: "Sofia Kaya", rating: 4.8, answers: 540 }
];

export default function ExpertsPage() {
  return (
    <div className="container">
      <h1>Unsere Experten</h1>
      <div className="grid-3">
        {experts.map((expert) => (
          <div className="card" key={expert.name}>
            <span className="badge">verifiziert</span>
            <h3>{expert.name}</h3>
            <p className="small">Bewertung {expert.rating} · {expert.answers} Antworten</p>
          </div>
        ))}
      </div>
    </div>
  );
}
