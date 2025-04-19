import './FeatureSection.css';

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="container text-center">
        <h2 className="section-title">How It Works</h2>
        <div className="features-steps">
          <div className="feature-step">
            <div className="step-icon">📋</div>
            <h4>View Characters</h4>
            <p>Browse a growing list of Marvel heroes and villains, complete with images and powers.</p>
          </div>
          <div className="feature-step">
            <div className="step-icon">📝</div>
            <h4>Edit Entries</h4>
            <p>Update any character's name, alias, powers, or alignment with ease.</p>
          </div>
          <div className="feature-step">
            <div className="step-icon">➕</div>
            <h4>Add Characters</h4>
            <p>Add your favorite characters to the database and keep your list growing.</p>
          </div>
          <div className="feature-step">
            <div className="step-icon">🗑️</div>
            <h4>Delete with Confidence</h4>
            <p>Remove characters with a confirmation prompt to avoid accidental deletions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
