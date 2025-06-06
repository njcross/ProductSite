import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import EditableImage from '../components/EditableImage';
import EditableField from '../components/EditableField';
import CharacterCarousel from '../components/CharacterCarousel';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './KitsLandingPage.css';

function KitsLandingPage() {
  const [kits, setKits] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/api/kits`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        credentials: 'include',
      },
    })
      .then((res) => res.json())
      .then((data) => setKits(data));
  }, [API_BASE]);

  return (
    <div className="kits-landing-page">
      <Helmet>
  <title>My Play Trays</title>
  <meta name="description" content="Browse our fun and educational kits for kids of all ages. Unlock & play with  creativity!" />
  <meta property="og:title" content="My Play Tray" />
  <meta property="og:description" content="Fun trays delivered to your locker. Perfect for imaginative kids." />
  <meta property="og:image" content="https://myplaytray.com/images/kit-og-image.jpg" />
  <meta property="og:url" content="https://myplaytray.com/" />
</Helmet>
      <section className="hero-section-kit">
      <div className="hero-banner">
        <div className="hero-content">
          <h1><EditableField contentKey="content_203" /></h1>
          <p><EditableField contentKey="content_204" /></p>
          <div className="hero-cta text-start">
            <Button variant="danger" className="browse-btn" href="/cards">
              <EditableField contentKey="content_205" />
            </Button>
          </div>
        </div>
        <div className="hero-image-container">
          <EditableImage contentKey="content_img_206" alt="Choose Kit" className="hero-img" />
        </div>
      </div>
      </section>

      {/* Steps Section */}
      <Container className="steps-section text-center">
        <Row className="d-flex justify-content-center">
          <div className="step-col">
            <EditableImage contentKey="content_img_208" alt="Choose Kit" className="step-img" />
            <h5><EditableField contentKey="content_209" /></h5>
          </div>
          <div className="step-col">
            <EditableImage contentKey="content_img_210" alt="Get Locker Code" className="step-img" />
            <h5><EditableField contentKey="content_211" /></h5>
          </div>
          <div className="step-col">
            <EditableImage contentKey="content_img_212" alt="Unlock & Play" className="step-img" />
            <h5><EditableField contentKey="content_213" /></h5>
          </div>
        </Row>
         <div className="works-cta text-center">
        <Button variant="danger" className="browse-btn mt-3" href="/cards">
          <EditableField contentKey="content_207" />
        </Button>
      </div>
      </Container>
      


      {/* Kits Grid */}
      <Container className="kits-grid">
        <h2 className="text-center mb-4">
          <EditableField contentKey="content_214" />
        </h2>
        <Row className="g-4 align-items-stretch">
          {kits.slice(0, 25).map((kit, idx) => (
            <Col key={kit.id || idx} xs={6} md={4} lg={3}>
              <Card className="kit-card text-center">
                <div className="kit-image-wrapper">
                  <Card.Img
                    variant="top"
                    src={kit.image_url || '/images/kit-placeholder.png'}
                    className="kit-image"
                  />
                </div>
                <Card.Body className="kit-body">
                  <Card.Title>{kit.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <EditableField contentKey="content_215" />
      </Container>

      <section className="container">
        <div className="row gx-4 gy-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="carousel-column">
              <h2><EditableField contentKey="content_216" /></h2>
              <CharacterCarousel filter={[1]} />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div className="carousel-column h-100">
              <h2><EditableField contentKey="content_217" /></h2>
              <CharacterCarousel filter={[2]} />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mx-md-auto">
            <div className="carousel-column h-100">
              <h2><EditableField contentKey="content_218" /></h2>
              <CharacterCarousel filter={[4]} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default KitsLandingPage;
