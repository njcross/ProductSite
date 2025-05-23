import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Container, Table, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getAddressFromLatLng } from '../utils/googleApiService';
import setCurrentPage from '../components/PaginationControls';
import FilterBy from '../components/FilterBy';
import ViewingOptions from '../components/ViewingOptions';
import PaginationControls from '../components/PaginationControls';
import './Orders.css';

export default function Orders() {
  const { currentUser } = useUser();
  const [purchases, setPurchases] = useState([]);
  const [addressMap, setAddressMap] = useState({});
  const [viewAll, setViewAll] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL;

  const [filters, setFilters] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('date');

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

      <div className="orders-page d-flex">
          <div className="sidebar">
            <FilterBy
              filters={filters}
              setFilters={setFilters}
              showFavorites={false}
            />
          </div>
          <div className="main-content flex-grow-1">
            <ViewingOptions
              viewMode={viewMode}
              setViewMode={setViewMode}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showSaveFilter={false}
            />

      {purchases.length === 0 ? (
        <p className="text-center text-muted">
          <EditableField contentKey="content_229" />
        </p>
      ) : (
        <Table responsive bordered hover className="orders-table">
  <thead>
    <tr>
      <th><EditableField contentKey="content_232" defaultText="Kit Name" /></th>
      <th><EditableField contentKey="content_233" defaultText="Image" /></th>
      {viewAll && <th><EditableField contentKey="content_230" defaultText="User ID" /></th>}
      <th><EditableField contentKey="content_250" defaultText="Location" /></th>
      <th><EditableField contentKey="content_234" defaultText="Quantity" /></th>
      <th><EditableField contentKey="content_235" defaultText="Date" /></th>
      <th><EditableField contentKey="content_255" defaultText="Payment Method" /></th>
      <th><EditableField contentKey="content_256" defaultText="Available Date" /></th>
      <th><EditableField contentKey="content_257" defaultText="Pick-Up Date" /></th>
      <th><EditableField contentKey="content_258" defaultText="Kit Description" /></th>
      <th><EditableField contentKey="content_259" defaultText="Total" /></th>
    </tr>
  </thead>
  <tbody>
    {purchases.map((purchase) => {
      const address = purchase.inventory?.location;
      const total = purchase.kit?.price && purchase.quantity
        ? (purchase.kit.price * purchase.quantity).toFixed(2)
        : '—';

      return (
        <tr key={purchase.id}>
          <td>{purchase.kit?.name}</td>
          <td><img src={purchase.kit?.image_url} alt={purchase.kit?.name} style={{ width: '60px' }} /></td>
          {viewAll && <td>{purchase.user_id}</td>}
          <td>{address}</td>
          <td>{purchase.quantity}</td>
          <td>{new Date(purchase.time_bought).toLocaleString()}</td>
          <td>{purchase.payment_method || '—'}</td>
          <td>{purchase.available_date || '—'}</td>
          <td>{purchase.pick_up_date || '—'}</td>
          <td>{purchase.kit?.description || '—'}</td>
          <td>${total}</td>
        </tr>
      );
    })}
  </tbody>
</Table>

      )}
      <PaginationControls
                currentPage={1} // Replace with actual current page
                setCurrentPage={setCurrentPage}
                totalItems={100} // Replace with actual total
                itemsPerPage={itemsPerPage}
              />
      </div>
      </div>
    </Container>
  );
}
