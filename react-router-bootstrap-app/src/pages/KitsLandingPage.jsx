import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import './KitsLandingPage.css';

function KitsLandingPage() {
  const [kits, setKits] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;
  useEffect(() => {
    // Simulate fetch from character database
    fetch(`${API_BASE}/characters`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          credentials: 'include'
        }
      })
      .then((res) => res.json())
      .then((data) => setKits(data));
  }, [API_BASE]);

  return (
    <div className="kits-landing-page">
      <div className="hero-banner text-white"></div>

<div className="hero-cta text-center">
  <Button variant="danger" className="browse-btn mt-3" href="/cards">
    Browse our Kits
  </Button>
</div>
<div className="works-cta text-center">
  <Button variant="danger" className="browse-btn mt-3" href="/cards">
    How it Works
  </Button>
</div>
      

      {/* Steps Section */}
      <Container className="steps-section text-center my-5">
        <Row>
          <Col md={4}>
            <img src="/images/step1.png" alt="Choose Kit" className="step-img" />
            <h5>Choose a Kit</h5>
          </Col>
          <Col md={4}>
            <img src="/images/step2.png" alt="Get Locker Code" className="step-img" />
            <h5>Get Locker Code</h5>
          </Col>
          <Col md={4}>
            <img src="/images/step3.png" alt="Unlock & Play" className="step-img" />
            <h5>Unlock & Play!</h5>
          </Col>
        </Row>
      </Container>

      {/* Kits Grid */}
      <Container className="kits-grid my-5">
        <h2 className="text-center mb-4">25 Fun-Filled Kits to Choose From</h2>
        <Row>
          {kits.slice(0, 25).map((kit, idx) => (
            <Col key={kit.id || idx} xs={6} md={4} lg={3} className="mb-4">
              <Card className="kit-card text-center">
                <Card.Img variant="top" src={kit.image_url || '/images/kit-placeholder.png'} className="kit-image" />
                <Card.Body>
                  <Card.Title>{kit.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default KitsLandingPage;