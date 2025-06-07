import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Container, Table, ToggleButtonGroup, ToggleButton, Button } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet-async';
import FilterBy from '../components/FilterBy';
import ViewingOptions from '../components/ViewingOptions';
import PaginationControls from '../components/PaginationControls';
import ReviewModal from '../components/ReviewModal';
import './Orders.css';

const LOCAL_STORAGE_KEY = 'ordersFilters';

export default function Orders() {
  const { currentUser } = useUser();
  const [purchases, setPurchases] = useState([]);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [viewAll, setViewAll] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeKitId, setActiveKitId] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [refreshCount, setRefreshCount] = useState(0);

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (!currentUser) return;

    const baseUrl = viewAll && currentUser.role === 'admin'
      ? `${API_BASE}/api/purchases/all`
      : `${API_BASE}/api/purchases`;

    const params = new URLSearchParams({
      age_ids: (filters.age_ids || []).join(','),
      category_ids: (filters.category_ids || []).join(','),
      theme_ids: (filters.theme_ids || []).join(','),
      grade_ids: (filters.grade_ids || []).join(','),
      location_names: (filters.location_names || []).join(','),
      rating: filters.rating || '',
      sort_by: sortBy,
      sort_dir: sortDir,
      page: currentPage,
      per_page: itemsPerPage,
    });

    fetch(`${baseUrl}?${params}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setPurchases(data))
      .catch(err => console.error('Error fetching purchases:', err));
  }, [currentUser, viewAll, filters, sortBy, sortDir, currentPage, itemsPerPage, refreshCount]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const res = await fetch(`${API_BASE}/api/purchases/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok) {
      setPurchases(prev => prev.filter(p => p.id !== id));
    } else {
      alert('Failed to cancel order');
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const res = await fetch(`${API_BASE}/api/purchases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPurchases(prev =>
          prev.map(p => (p.id === id ? { ...p, ...updated } : p))
        );
      } else {
        alert('Failed to update purchase');
      }
    } catch (err) {
      console.error('Error updating purchase:', err);
      alert('Error updating purchase');
    }
  };

  const paginatedPurchases = purchases;

  if (!currentUser) return null;

  return (
    <Container className="orders-page py-4">
      <Helmet>
        <title>Purchase History – My Play Trays</title>
        <meta name="description" content="Track your past Play tray purchases." />
      </Helmet>

      <h2 className="text-center mb-4">
        <EditableField contentKey="content_226" defaultText="Purchase History" />
      </h2>

      {currentUser.role === 'admin' && (
        <div className="text-center mb-4">
          <ToggleButtonGroup type="radio" name="viewToggle" defaultValue={false} onChange={val => setViewAll(val)}>
            <ToggleButton id="tbg-radio-1" value={false} variant="outline-primary">
              <EditableField contentKey="content_227" defaultText="My Purchases" />
            </ToggleButton>
            <ToggleButton id="tbg-radio-2" value={true} variant="outline-primary">
              <EditableField contentKey="content_228" defaultText="All Purchases" />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}

      <div className="orders-page d-flex">
        <div className="sidebar">
          <FilterBy
            selectedAges={filters.age_ids || []}
            selectedCategories={filters.category_ids || []}
            selectedThemes={filters.theme_ids || []}
            selectedGrades={filters.grade_ids || []}
            selectedLocations={filters.location_names || []}
            collection="orders"
            currentUser={currentUser}
            onFilterChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
          />
          <Button
            variant="outline-secondary"
            size="sm"
            className="mt-3"
            onClick={() => {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              setFilters({});
            }}
          >
            Reset Filters
          </Button>
        </div>

        <div className="main-content flex-grow-1">
          <ViewingOptions
            collection="orders"
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortDir={sortDir}
            onSortDirChange={setSortDir}
            showSaveFilter={false}
          />

          {paginatedPurchases.length === 0 ? (
            <p className="text-center text-muted">
              <EditableField contentKey="content_229" defaultText="No purchases found." />
            </p>
          ) : (
            
            <Table responsive bordered hover className="orders-table">
              <thead>
                <tr>
                  <th><EditableField contentKey="content_232" defaultText="Kit Name" /></th>
                  {viewAll && <th><EditableField contentKey="content_230" defaultText="User ID" /></th>}
                  <th><EditableField contentKey="content_250" defaultText="Location Name" /></th>
                  <th><EditableField contentKey="content_234" defaultText="Quantity" /></th>
                  <th><EditableField contentKey="content_235" defaultText="Order Date" /></th>
                  <th><EditableField contentKey="content_255" defaultText="Payment Method" /></th>
                  <th><EditableField contentKey="content_256" defaultText="Locker Combo" /></th>
                  <th><EditableField contentKey="content_257" defaultText="Return Due Date" /></th>
                  <th><EditableField contentKey="content_259" defaultText="Total" /></th>
                  <th><EditableField contentKey="content_269" defaultText="Status" /></th>
                  <th><EditableField contentKey="content_313" defaultText="Shipping Address" /></th>
                  <th><EditableField contentKey="content_268" defaultText="Actions" /></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPurchases.map(purchase => {
                  const address = purchase.inventory?.location_name;
                  const total = purchase.kit?.price && purchase.quantity
                    ? (purchase.kit.price * purchase.quantity).toFixed(2)
                    : '—';

                  return (
                    <tr key={purchase.id}>
                      <td>{purchase.kit?.name} <img src={purchase.kit?.image_url} alt={purchase.kit?.name} style={{ width: '60px' }} /></td>
                      {viewAll && <td>{purchase.user_id}</td>}
                      <td>{address}</td>
                      <td>{purchase.quantity}</td>
                      <td>{new Date(purchase.time_bought).toLocaleString()}</td>
                      <td>{purchase.payment_method || '—'}</td>

                      {/* Available Date */}
                      <td>
                        {currentUser.role === 'admin' ? (
                          <input
                            type="number"
                            value={purchase.available_date || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPurchases(prev =>
                                prev.map(p => p.id === purchase.id ? { ...p, available_date: value } : p)
                              );
                            }}
                          />
                        ) : (purchase.available_date || '—')}
                      </td>

                      {/* Pick-Up Date */}
                      <td>
                        {currentUser.role === 'admin' ? (
                          <input
                            type="date"
                            value={purchase.pick_up_date?.slice(0, 10) || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPurchases(prev =>
                                prev.map(p => p.id === purchase.id ? { ...p, pick_up_date: value } : p)
                              );
                            }}
                          />
                        ) : (
                          new Date(purchase.pick_up_date).toLocaleDateString()
                        )}
                      </td>

                      {/* Total */}
                      <td>${total}</td>

                      {/* Status Dropdown */}
                      <td>
                        {currentUser.role === 'admin' ? (
                          <select
                            value={
                              ['Ready for pickup', 'Being prepared', 'Over-due', 'Cancelled', 'Checked-out', 'Returned'].includes(purchase.status)
                                ? purchase.status
                                : ''
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setPurchases(prev =>
                                prev.map(p => p.id === purchase.id ? { ...p, status: value } : p)
                              );
                            }}
                          >
                            <option value="" disabled>-- Select Status --</option>
                            {['Ready for pickup', 'Being prepared', 'Over-due', 'Cancelled', 'Checked-out', 'Returned'].map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          purchase.status || '—'
                        )}
                      </td>

                      {/* Shipping Address */}
                      <td>
                        {purchase.shipping_address ? (
                          <>
                            {purchase.shipping_address.line1}<br />
                            {purchase.shipping_address.city}, {purchase.shipping_address.state}<br />
                            {purchase.shipping_address.postal_code}, {purchase.shipping_address.country}
                          </>
                        ) : '—'}
                      </td>

                      {/* Action Buttons */}
                      <td>
                        {currentUser.role === 'admin' && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            className="mb-2"
                            onClick={() => {
                              const { status, available_date, pick_up_date } = purchase;
                              handleUpdate(purchase.id, 'status', status);
                              handleUpdate(purchase.id, 'available_date', available_date);
                              handleUpdate(purchase.id, 'pick_up_date', pick_up_date);
                            }}
                          >
                            Save
                          </Button>
                        )}
                        <br />
                        <Button
                          size="sm"
                          variant="outline-info"
                          className="mb-2"
                          onClick={() => {
                            setActiveKitId(purchase.kit?.id);
                            setShowReviewModal(true);
                          }}
                        >
                          Review
                        </Button>
                        <br />
                        <Button size="sm" variant="outline-danger" onClick={() => handleCancel(purchase.id)}>
                          Cancel
                        </Button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}

          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={paginatedPurchases.length}
            itemsPerPage={itemsPerPage}
          />

          <ReviewModal
            show={showReviewModal}
            onHide={() => setShowReviewModal(false)}
            kitId={activeKitId}
            onSubmit={() => setRefreshCount(prev => prev + 1)}
          />
        </div>
      </div>
    </Container>
  );
}
