// src/components/HeroCarousel.jsx
import React from 'react';


import EditableField from '../components/EditableField';import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './HeroCarousel.css'; // Keep using your existing custom styles
import EditableImage from '../components/EditableImage'; // Assuming you have an EditableImage component
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
          <EditableImage contentKey="content_img_132" alt="Choose Kit" className="background_image1" />
          <div className="slide-content">
            <h1>{<EditableField contentKey="content_59" />}</h1>
            <p>{<EditableField contentKey="content_60" />}</p>
          </div>
        </div>
        <div className="hero-slide slide-2">
        <EditableImage contentKey="content_img_131" alt="Choose Kit" className="background_image2" />
          <div className="slide-content">
            <h1>{<EditableField contentKey="content_61" />}</h1>
            <p>{<EditableField contentKey="content_62" />}</p>
          </div>
        </div>
        <div className="hero-slide slide-3">
        <EditableImage contentKey="content_img_133" alt="Choose Kit" className="background_image3" />
          <div className="slide-content">
            <h1>{<EditableField contentKey="content_63" />}</h1>
            <p>{<EditableField contentKey="content_64" />}</p>
          </div>
        </div>
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
