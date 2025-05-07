import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import FilterBy from '../components/FilterBy';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import ViewingOptions from '../components/ViewingOptions';

export default function InventoryPage({ user }) {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({
    location: '',
    location_name: '',
    quantity: '',
    kit_id: '',
  });
  const { currentUser } = useUser();

  const API_BASE = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';

  const [filters, setFilters] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetch(`${API_BASE}/api/inventory`, { credentials: 'include' })
      .then(res => res.json())
      .then(setInventory)
      .catch(console.error);
  }, [currentUser, navigate]);

  const handleUpdate = (inv) => {
    fetch(`${API_BASE}/api/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(inv),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update');
        alert('Inventory updated');
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (inv) => {
    const confirmed = window.confirm('Are you sure?');
    if (!confirmed) return;

    fetch(`${API_BASE}/api/inventory?kit_id=${inv.kit_id}&location=${encodeURIComponent(inv.location)}`, {
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

  const handleChange = (index, field, value) => {
    setInventory(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  return (
    <Container className="mt-4">
      <Helmet>
              <title>My Play Tray's Inventory Managment - Admin only</title>
              <meta name="description" content="Browse all inventory of Play trays" />
            </Helmet>
      <h2>Inventory Management</h2>
<div className="inventory-page d-flex">
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
      <Table bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Kit ID</th>
            <th>Location</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((inv, i) => (
            <tr key={inv.id}>
              <td>{inv.kit_id}</td>
              <td>{inv.location}</td>
              <td>
                <Form.Control
                  value={inv.location_name}
                  onChange={(e) => handleChange(i, 'location_name', e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={inv.quantity}
                  onChange={(e) => handleChange(i, 'quantity', e.target.value)}
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
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={100} // Replace with actual total
                itemsPerPage={itemsPerPage}
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
