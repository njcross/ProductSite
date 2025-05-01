import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import EditableImage from '../components/EditableImage';
import EditableField from '../components/EditableField';
import CharacterCarousel from '../components/CharacterCarousel';
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
      <div className="hero-banner">
        <div className="hero-content">
          <h1><EditableField contentKey="content_203" /></h1>
          <p><EditableField contentKey="content_204" /></p>
          <div className="hero-cta text-start">
            <Button variant="danger" className="browse-btn mt-3" href="/cards">
              <EditableField contentKey="content_205" />
            </Button>
          </div>
        </div>
        <div className="hero-image-container">
          <EditableImage contentKey="content_img_206" alt="Choose Kit" className="hero-img" />
        </div>
      </div>

      <div className="works-cta text-center">
        <Button variant="danger" className="browse-btn mt-3" href="/cards">
          <EditableField contentKey="content_207" />
        </Button>
      </div>

      {/* Steps Section */}
      <Container className="steps-section text-center my-5">
        <Row>
          <Col md={4}>
            <EditableImage contentKey="content_img_208" alt="Choose Kit" className="step-img" />
            <h5><EditableField contentKey="content_209" /></h5>
          </Col>
          <Col md={4}>
            <EditableImage contentKey="content_img_210" alt="Get Locker Code" className="step-img" />
            <h5><EditableField contentKey="content_211" /></h5>
          </Col>
          <Col md={4}>
            <EditableImage contentKey="content_img_212" alt="Unlock & Play" className="step-img" />
            <h5><EditableField contentKey="content_213" /></h5>
          </Col>
        </Row>
      </Container>

      {/* Kits Grid */}
      <Container className="kits-grid my-5">
        <h2 className="text-center mb-4">
          <EditableField contentKey="content_214" />
        </h2>
        <Row>
          {kits.slice(0, 25).map((kit, idx) => (
            <Col key={kit.id || idx} xs={6} md={4} lg={3} className="mb-4">
              <Card className="kit-card text-center">
                <Card.Img
                  variant="top"
                  src={kit.image_url || '/images/kit-placeholder.png'}
                  className="kit-image"
                />
                <Card.Body>
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
