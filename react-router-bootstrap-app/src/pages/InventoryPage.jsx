import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import FilterBy from '../components/FilterBy';
import { Helmet } from 'react-helmet-async';
import ViewingOptions from '../components/ViewingOptions';
import PaginationControls from '../components/PaginationControls';
import './InventoryPage.css';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({
    location: '',
    location_name: '',
    quantity: '',
    kit_id: '',
  });

  const { currentUser } = useUser();
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';

  // ✅ FIX: use `location_names` to match FilterBy and API expectations
  const defaultFilters = { rating: '', location_names: [] };

  const [filters, setFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('filters_inventory')) || defaultFilters;
    } catch {
      return defaultFilters;
    }
  });

  const [viewMode, setViewMode] = useState('grid');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    // ✅ Save to localStorage with correct key
    console.log('[DEBUG] Saving filters to localStorage:', filters);
    localStorage.setItem('filters_inventory', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const params = new URLSearchParams({
      page,
      perPage: itemsPerPage,
      sortBy,
      sortDir,
      rating: filters.rating || '',
      location_names: (filters.location_names || []).join(','),
    });

    fetch(`${API_BASE}/api/inventory?${params}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const withOriginal = (data.items || []).map(item => ({
          ...item,
          original_location: item.location,
          original_kit_id: item.kit_id
        }));
        setInventory(withOriginal);
        setHasNext(!!data.hasNext);
      })
      .catch(console.error);
  }, [currentUser, navigate, page, itemsPerPage, sortBy, sortDir, filters]);

  const handleUpdate = (inv) => {
    const payload = {
      ...inv,
      original_kit_id: inv.kit_id,
      original_location: inv.original_location || inv.location,
    };

    fetch(`${API_BASE}/api/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update');
        alert('Inventory updated');
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (inv) => {
    if (!window.confirm('Are you sure?')) return;

    fetch(`${API_BASE}/api/inventory?kit_id=${inv.kit.id}&location=${encodeURIComponent(inv.location)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        setInventory(prev => prev.filter(i => i.id !== inv.id));
      })
      .catch(err => alert(err.message));
  };

  const handleAdd = () => {
    if (!newItem.location || !newItem.location_name || !newItem.quantity || !newItem.kit_id) {
      alert('Fill out all fields');
      return;
    }

    fetch(`${API_BASE}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newItem),
    })
      .then(res => res.json())
      .then(data => {
        setInventory(prev => [...prev, { ...newItem, id: data.inventory }]);
        setNewItem({ location: '', location_name: '', quantity: '', kit_id: '' });
      })
      .catch(err => alert('Failed to add item: ' + err.message));
  };

  const handleChange = (id, field, value) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              original_location: item.original_location,
              original_kit_id: item.original_kit_id || item.kit_id
            }
          : item
      )
    );
  };

  return (
    <Container className="mt-4">
      <Helmet>
        <title>My Play Tray's Inventory Management - Admin only</title>
        <meta name="description" content="Browse all inventory of Play trays" />
      </Helmet>
      <h2>Inventory Management</h2>
      <div className="inventory-page d-flex">
        <div className="sidebar">
          <Button
            variant="outline-secondary"
            size="sm"
            className="mb-2"
            onClick={() => setFilters(defaultFilters)}
          >
            Reset Filters
          </Button>
          <FilterBy
            filters={filters}
            setFilters={setFilters}
            onFilterChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
            showFavorites={false}
            collection="inventory"
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
            collection="inventory"
            sortDir={sortDir}
            onSortDirChange={setSortDir}
          />

          <Table bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Tray Name</th>
                <th>Location</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((inv) => (
                <tr key={`${inv.kit_id}-${inv.location}`}>
                  <td>
                    {inv.kit?.image_url && (
                      <img
                        src={inv.kit.image_url}
                        alt={inv.kit.name}
                        style={{ width: '50px', marginRight: '8px' }}
                      />
                    )}
                    {inv.kit?.name || `Kit ID: ${inv.kit_id}`}
                  </td>
                  <td>
                    <Form.Control
                      value={inv.location}
                      onChange={(e) => handleChange(inv.id, 'location', e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={inv.location_name}
                      onChange={(e) => handleChange(inv.id, 'location_name', e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={inv.quantity}
                      onChange={(e) => handleChange(inv.id, 'quantity', e.target.value)}
                    />
                  </td>
                  <td>
                    <Button variant="success" onClick={() => handleUpdate(inv)} className="me-2">Save</Button>
                    <Button variant="danger" onClick={() => handleDelete(inv)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PaginationControls
            page={page}
            onPageChange={setPage}
            hasNext={hasNext}
            currentPage={page}
          />
        </div>
      </div>

      <h4 className="mt-5">Add New Inventory Item</h4>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            placeholder="Location (address)"
            value={newItem.location}
            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            placeholder="Name"
            value={newItem.location_name}
            onChange={(e) => setNewItem({ ...newItem, location_name: e.target.value })}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Qty"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            placeholder="Kit ID"
            value={newItem.kit_id}
            onChange={(e) => setNewItem({ ...newItem, kit_id: e.target.value })}
          />
        </Col>
        <Col md={2}>
          <Button onClick={handleAdd}>Add</Button>
        </Col>
      </Row>
    </Container>
  );
}
