import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Container, Table, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getAddressFromLatLng } from '../utils/googleApiService';
import './Orders.css';

export default function Orders() {
  const { currentUser } = useUser();
  const [purchases, setPurchases] = useState([]);
  const [addressMap, setAddressMap] = useState({});
  const [viewAll, setViewAll] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!currentUser) return;
    const url = viewAll && currentUser.role === 'admin'
      ? `${API_BASE}/api/purchases/all`
      : `${API_BASE}/api/purchases`;

    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPurchases(data);
        fetchAddresses(data);
      })
      .catch(err => console.error('Error fetching purchases:', err));
  }, [currentUser, viewAll, API_BASE]);

  const fetchAddresses = async (purchases) => {
    const map = {};
    for (const p of purchases) {
      const loc = p.inventory?.location;
      if (loc && !addressMap[loc]) {
        const [lat, lng] = loc.split(',').map(Number);
        const address = await getAddressFromLatLng(lat, lng);
        map[loc] = address || 'Unknown location';
      }
    }
    setAddressMap(prev => ({ ...prev, ...map }));
  };

  if (!currentUser) return null;

  return (
    <Container className="orders-page py-4">
      <Helmet>
        <title>Purchase History – My Play Trays</title>
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
              <th><EditableField contentKey="content_250" defaultText="Location" /></th> {/* Location */}
              <th><EditableField contentKey="content_234" /></th> {/* Quantity */}
              <th><EditableField contentKey="content_235" /></th> {/* Date */}
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => {
              const loc = purchase.inventory?.location;
              const address = loc ? addressMap[loc] || 'Loading...' : '—';
              return (
                <tr key={purchase.id}>
                  <td>{purchase.kit.name}</td>
                  <td><img src={purchase.kit.image_url} alt={purchase.kit.name} style={{ width: '60px' }} /></td>
                  {viewAll && <td>{purchase.user_id}</td>}
                  <td>{address}</td>
                  <td>{purchase.quantity}</td>
                  <td>{new Date(purchase.time_bought).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
