import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Container, Row, Col, Card, Button, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet';
import './Orders.css';

export default function Orders() {
  const { currentUser } = useUser();
  const [purchases, setPurchases] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!currentUser) return;
    const url = viewAll && currentUser.role === 'admin'
      ? `${API_BASE}/api/purchases/all`
      : `${API_BASE}/api/purchases`;

    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setPurchases(data))
      .catch(err => console.error('Error fetching purchases:', err));
  }, [currentUser, viewAll, API_BASE]);

  if (!currentUser) return null;

  return (
    <Container className="orders-page py-4">
        <Helmet>
        <title>Purchase History – Play Kits</title>
        <meta name="description" content="Track your past Play kit purchases." />
      </Helmet>
      <h2 className="text-center mb-4">
        <EditableField contentKey="content_226" />
      </h2>

      {currentUser.role === 'admin' && (
        <div className="text-center mb-4">
          <ToggleButtonGroup type="radio" name="viewToggle" defaultValue={false} onChange={(val) => setViewAll(val)}>
            <ToggleButton id="tbg-radio-1" value={false} variant="outline-primary">
              <EditableField contentKey="content_227" />
            </ToggleButton>
            <ToggleButton id="tbg-radio-2" value={true} variant="outline-primary">
              <EditableField contentKey="content_228" />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}

      {purchases.length === 0 ? (
        <p className="text-center text-muted">
          <EditableField contentKey="content_229" />
        </p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {purchases.map((purchase) => (
            <Col key={purchase.id}>
              <Card className="h-100">
                <Card.Img variant="top" src={purchase.kit.image_url} alt={purchase.kit.name} />
                <Card.Body>
                  <Card.Title>{purchase.kit.name}</Card.Title>
                  <Card.Text>
                    <strong><EditableField contentKey="content_230" />:</strong> {purchase.user_id} <br />
                    <strong><EditableField contentKey="content_231" />:</strong> {purchase.kit_id} <br />
                    <strong><EditableField contentKey="content_232" />:</strong> {purchase.kit.name} <br />
                    <strong><EditableField contentKey="content_233" />:</strong> <img src={purchase.kit.image_url} alt="" style={{ width: '60px' }} /> <br />
                    <strong><EditableField contentKey="content_234" />:</strong> {purchase.quantity} <br />
                    <strong><EditableField contentKey="content_235" />:</strong> {new Date(purchase.time_bought).toLocaleString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
