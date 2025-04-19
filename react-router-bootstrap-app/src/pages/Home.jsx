import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CharacterCarousel from '../components/CharacterCarousel.jsx';
import FeaturesSection from '../components/FeatureSection.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <HeroCarousel />
      <FeaturesSection />

      <section className="carousel-group">
        <div className="carousel-column">
          <h2>Popular Heroes</h2>
          <CharacterCarousel filter="hero" />
        </div>
        <div className="carousel-column">
          <h2>Infamous Villains</h2>
          <CharacterCarousel filter="villain" />
        </div>
        <div className="carousel-column">
          <h2>Trending Characters</h2>
          <CharacterCarousel filter="trending" />
        </div>
      </section>
    </div>
  );
}
