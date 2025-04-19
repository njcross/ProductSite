// src/components/HeroCarousel.jsx
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './HeroCarousel.css'; // Keep using your existing custom styles

const HeroCarousel = () => {
  return (
    <section className="hero-carousel">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
        transitionTime={800}
        showArrows={true}
        emulateTouch
        swipeable
        stopOnHover
      >
        <div className="hero-slide slide-1">
          <div className="slide-content">
            <h1>Welcome to AllyShop</h1>
            <p>Discover the latest Marvel characters and their stories.</p>
          </div>
        </div>
        <div className="hero-slide slide-2">
          <div className="slide-content">
            <h1>Manage Your Favorites</h1>
            <p>Edit, add, or remove characters with ease.</p>
          </div>
        </div>
        <div className="hero-slide slide-3">
          <div className="slide-content">
            <h1>Stay Updated</h1>
            <p>Keep track of new additions to the Marvel universe.</p>
          </div>
        </div>
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
