import { useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { getAddressFromLatLng } from '../utils/googleApiService';
import './InventorySection.css'

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  marginTop: '1rem',
};

export default function InventorySection({ kitId, isAdmin, isLoggedIn, selectedInventoryId, setSelectedInventoryId }) {
  const [inventories, setInventories] = useState([]);
  const [newInventory, setNewInventory] = useState({ location: '', location_name: '', quantity: '' });
  const [addressMap, setAddressMap] = useState({});
  const [useExistingLocation, setUseExistingLocation] = useState(true);
  const [inventoryOptions, setInventoryOptions] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['marker'],
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/inventory/${kitId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setInventories(data);
      })
      .catch(console.error);
  }, [kitId]);

  useEffect(() => {
    fetch(`${API_BASE}/api/inventory/locations`)
      .then(res => res.json())
      .then(setInventoryOptions)
      .catch(console.error);
  }, []);
  

  const handleChange = (index, field, value) => {
    setInventories(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleUpdate = async (index) => {
    const inv = inventories[index];
    const res = await fetch(`${API_BASE}/api/inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        kit_id: kitId,
        location: inv.location,
        location_name: inv.location_name,
        quantity: inv.quantity,
      }),
    });
    if (!res.ok) alert('Failed to update inventory item');
  };

  const handleDelete = async (location) => {
    const confirmed = window.confirm('Delete this inventory item?');
    if (!confirmed) return;
    const res = await fetch(`${API_BASE}/api/inventory?kit_id=${kitId}&location=${location}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setInventories(prev => prev.filter(i => i.location !== location));
    } else {
      alert('Failed to delete inventory item');
    }
  };

  const handleAdd = async () => {
    if (!newInventory.location || !newInventory.location_name || !newInventory.quantity) {
      alert('Fill all fields');
      return;
    }
  
    const res = await fetch(`${API_BASE}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...newInventory, kit_id: kitId }),
    });
  
    if (res.ok) {
      setNewInventory({ location: '', location_name: '', quantity: '' });
      // Refresh inventory list from server
      const refreshed = await fetch(`${API_BASE}/api/inventory/${kitId}`, { credentials: 'include' }).then(res => res.json());
      setInventories(refreshed);
    } else {
      alert('Failed to add inventory item');
    }
  };
  

  const parseLatLng = (str) => {
    if (!str || !str.includes(',')) return { lat: 0, lng: 0 };
    const [lat, lng] = str.split(',').map(Number);
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  };

  return (
    <div className="inventory-section">
      <h4>Inventory Locations</h4>

      {inventories.map((inv, i) => (
        <Row key={inv.location} className="align-items-center mb-2">
          {isLoggedIn && (
            <Col xs="auto">
              <Form.Check
                type="radio"
                name="inventorySelect"
                checked={selectedInventoryId === inv.id}
                onChange={() => setSelectedInventoryId(inv.id)}
                label=""
              />
            </Col>
          )}

          {isAdmin ? (
            <>
              <Col sm={3}><Form.Control value={inv.location} /></Col>
              <Col sm={3}>
                <Form.Control
                  value={inv.location_name}
                  onChange={(e) => handleChange(i, 'location_name', e.target.value)}
                />
              </Col>
              <Col sm={2}>
                <Form.Control
                  type="number"
                  value={inv.quantity}
                  onChange={(e) => handleChange(i, 'quantity', e.target.value)}
                />
              </Col>
              <Col sm="auto">
                <Button variant="outline-success" onClick={() => handleUpdate(i)}>💾</Button>
              </Col>
              <Col sm="auto">
                <Button variant="outline-danger" onClick={() => handleDelete(inv.location)}>🗑</Button>
              </Col>
            </>
          ) : (
            <>
              <Col><strong>{inv.location || 'Loading address...'}</strong></Col>
              <Col>{inv.quantity} units</Col>
            </>
          )}

          {isLoggedIn && (
            <Col xs={12}>
              <small className="text-muted">Select this location</small>
            </Col>
          )}
        </Row>
      ))}

      {isAdmin && (
        <div className="mt-4">
          <h5>Add New Inventory</h5>
          <Row className="mb-2 align-items-end">
            {/* Existing location dropdown */}
            <Col sm={3}>
              <Form.Group controlId="existingLocation">
                <Form.Label>Choose Existing Location</Form.Label>
                <Form.Select
                  value={newInventory.location}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setNewInventory(prev => ({
                      ...prev,
                      location: selected,
                      location_name: selected  // Default name same as location
                    }));
                  }}
                >
                  <option value="">-- Create New --</option>
                  {inventoryOptions.map((opt, i) => (
                    <option key={i} value={opt.location}>
                      {opt.location_name || opt.location}
                    </option>
                  ))}

                </Form.Select>
              </Form.Group>
            </Col>

            {/* OR enter new location manually */}
            <Col sm={3}>
              <Form.Group controlId="manualLocation">
                <Form.Label>Or Enter New Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="New Address or Place"
                  value={newInventory.location}
                  onChange={(e) => setNewInventory(prev => ({
                    ...prev,
                    location: e.target.value,
                    location_name: e.target.value  // Use same value as name by default
                  }))}
                />
              </Form.Group>
            </Col>

            {/* Optional: override location_name */}
            <Col sm={3}>
              <Form.Group controlId="locationName">
                <Form.Label>Display Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Optional custom name"
                  value={newInventory.location_name}
                  onChange={(e) => setNewInventory(prev => ({
                    ...prev,
                    location_name: e.target.value
                  }))}
                />
              </Form.Group>
            </Col>

            {/* Quantity */}
            <Col sm={2}>
              <Form.Group controlId="quantity">
                <Form.Label>Qty</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={newInventory.quantity}
                  onChange={(e) => setNewInventory(prev => ({
                    ...prev,
                    quantity: e.target.value
                  }))}
                />
              </Form.Group>
            </Col>

            <Col sm="auto">
              <Button className="mt-2" onClick={handleAdd}>＋</Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Google Map */}
      {isLoaded && inventories.length > 0 && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={parseLatLng(inventories[0].coordinates)}
          options={{ mapId: '15eaad764306adc0' }}
          onLoad={async (map) => {
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
            const bounds = new window.google.maps.LatLngBounds();

            inventories.forEach(inv => {
              if (!inv.coordinates || inv.location_name?.toLowerCase() === 'warehouse') return;
              const { lat, lng } = parseLatLng(inv.coordinates);
              bounds.extend({ lat, lng });

              const marker = new AdvancedMarkerElement({
                map,
                position: { lat, lng },
                title: inv.location_name || 'No name',
              });

              marker.addListener('click', () => {
                window.alert(`Location: ${inv.location_name || 'Unknown'}`);
              });
            });

            map.fitBounds(bounds);
          }}
        />
      )}
    </div>
  );
}
