import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Container, Row, Col, Card, Button, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet';
import { Table } from 'react-bootstrap';
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
        <title>Purchase History – Play Trays</title>
        <meta name="description" content="Track your past Play tray purchases." />
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
        <Table responsive bordered hover className="orders-table">
  <thead>
    <tr>
      <th><EditableField contentKey="content_232" /></th> {/* Kit Name */}
      <th><EditableField contentKey="content_233" /></th> {/* Image */}
      {viewAll && <th><EditableField contentKey="content_230" /></th>} {/* User ID */}
      <th><EditableField contentKey="content_231" /></th> {/* Kit ID */}
      <th><EditableField contentKey="content_234" /></th> {/* Quantity */}
      <th><EditableField contentKey="content_235" /></th> {/* Date */}
    </tr>
  </thead>
  <tbody>
    {purchases.map((purchase) => (
      <tr key={purchase.id}>
        <td>{purchase.kit.name}</td>
        <td><img src={purchase.kit.image_url} alt={purchase.kit.name} style={{ width: '60px' }} /></td>
        {viewAll && <td>{purchase.user_id}</td>}
        <td>{purchase.kit_id}</td>
        <td>{purchase.quantity}</td>
        <td>{new Date(purchase.time_bought).toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
</Table>
      )}
    </Container>
  );
}
