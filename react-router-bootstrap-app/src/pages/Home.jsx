import React from 'react';


import EditableField from '../components/EditableField';import 'bootstrap/dist/css/bootstrap.min.css';
import CharacterCarousel from '../components/CharacterCarousel.jsx';
import FeaturesSection from '../components/FeatureSection.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <Helmet>
              <title>Play Kits – Home</title>
              <meta name="description" content="Discover, explore, and play with kid-themed kits." />
            </Helmet>
      <HeroCarousel />
      <FeaturesSection />

      <section className="container">
  <div className="row gx-4 gy-4">
    <div className="col-12 col-md-6 col-lg-4">
      <div className="carousel-column">
        <h2>{<EditableField contentKey="content_116" />}</h2>
        <CharacterCarousel filter="hero" />
      </div>
    </div>
    <div className="col-12 col-md-6 col-lg-4">
      <div className="carousel-column h-100">
        <h2>{<EditableField contentKey="content_117" />}</h2>
        <CharacterCarousel filter="villain" />
      </div>
    </div>
    <div className="col-12 col-md-6 col-lg-4 mx-md-auto">
      <div className="carousel-column h-100">
        <h2>{<EditableField contentKey="content_118" />}</h2>
        <CharacterCarousel filter="trending" />
      </div>
    </div>
  </div>
</section>

    </div>
  );
}
