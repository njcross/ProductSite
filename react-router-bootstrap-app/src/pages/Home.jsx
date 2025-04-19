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

      <section className="container py-4">
  <div className="row gx-4 gy-4">
    <div className="col-12 col-md-6 col-lg-4">
      <div className="carousel-column h-100">
        <h2>Popular Heroes</h2>
        <CharacterCarousel filter="hero" />
      </div>
    </div>
    <div className="col-12 col-md-6 col-lg-4">
      <div className="carousel-column h-100">
        <h2>Infamous Villains</h2>
        <CharacterCarousel filter="villain" />
      </div>
    </div>
    <div className="col-12 col-md-6 col-lg-4 mx-md-auto">
      <div className="carousel-column h-100">
        <h2>Trending Characters</h2>
        <CharacterCarousel filter="trending" />
      </div>
    </div>
  </div>
</section>

    </div>
  );
}
