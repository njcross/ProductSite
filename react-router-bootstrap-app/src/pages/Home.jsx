import './Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CharacterCarousel from '../components/CharacterCarousel.jsx';

export default function Home() {

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-text">
          <h1>Marvel Character Database</h1>
          <p>Explore, edit, and manage your favorite Marvel characters in one epic place.</p>
        </div>
      </section>

      <section className="home-content">
        <h2>⚡ Features</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>📋 View Characters</h3>
            <p>Browse a growing list of Marvel heroes and villains, complete with images and powers.</p>
          </div>
          <div className="feature-item">
            <h3>📝 Edit Entries</h3>
            <p>Update any character's name, alias, powers, or alignment with ease.</p>
          </div>
          <div className="feature-item">
            <h3>➕ Add New Characters</h3>
            <p>Add your favorite characters to the database and keep your list growing.</p>
          </div>
          <div className="feature-item">
            <h3>🗑️ Delete with Confidence</h3>
            <p>Remove characters with a confirmation prompt to avoid accidental deletions.</p>
          </div>
        </div>
      </section>

      {/* Carousel of Character Cards */}
      <section className="character-carousel">
        <CharacterCarousel />
      </section>
    </div>
  );
}
