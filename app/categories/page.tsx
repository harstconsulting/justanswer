const categories = [
  "Recht",
  "Medizin",
  "Technik",
  "Auto",
  "Steuern",
  "Immobilien",
  "Haushalt",
  "Business"
];

export default function CategoriesPage() {
  return (
    <div className="container">
      <h1>Kategorien</h1>
      <div className="grid-3">
        {categories.map((cat) => (
          <div className="card" key={cat}>
            <h3>{cat}</h3>
            <p className="small">Unterkategorien und Experten verfügbar.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
