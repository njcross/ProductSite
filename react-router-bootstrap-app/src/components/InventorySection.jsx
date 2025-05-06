import { useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { getAddressFromLatLng } from '../utils/googleApiService';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  marginTop: '1rem',
};

export default function InventorySection({ kitId, isAdmin, isLoggedIn, selectedInventoryId, setSelectedInventoryId }) {
  const [inventories, setInventories] = useState([]);
  const [newInventory, setNewInventory] = useState({ location: '', location_name: '', quantity: '' });
  const [addressMap, setAddressMap] = useState({});

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
        if (!isAdmin) {
          fetchAddresses(data);
        }
      })
      .catch(console.error);
  }, [kitId]);

  const fetchAddresses = async (inventoryList) => {
    const map = {};
    for (let inv of inventoryList) {
      const [lat, lng] = inv.location.split(',').map(Number);
      try {
        const address = await getAddressFromLatLng(lat, lng); // ✅ await here
        map[inv.location] = address || 'Unknown address';
      } catch {
        map[inv.location] = 'Error fetching address';
      }
    }
    setAddressMap(map);
  };
  

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
      const result = await res.json();
      const added = { ...newInventory, id: result.inventory };
      setInventories(prev => [...prev, added]);
      setNewInventory({ location: '', location_name: '', quantity: '' });
      if (!isAdmin) {
        fetchAddresses([added]);
      }
    } else {
      alert('Failed to add inventory item');
    }
  };

  const parseLatLng = (str) => {
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
              <Col><strong>{addressMap[inv.location] || 'Loading address...'}</strong></Col>
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
          <Row className="mb-2">
            <Col sm={4}>
              <Form.Control
                placeholder="Lat,Long"
                value={newInventory.location}
                onChange={(e) => setNewInventory(prev => ({ ...prev, location: e.target.value }))}
              />
            </Col>
            <Col sm={4}>
              <Form.Control
                placeholder="Location Name"
                value={newInventory.location_name}
                onChange={(e) => setNewInventory(prev => ({ ...prev, location_name: e.target.value }))}
              />
            </Col>
            <Col sm={2}>
              <Form.Control
                type="number"
                placeholder="Qty"
                value={newInventory.quantity}
                onChange={(e) => setNewInventory(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </Col>
            <Col sm={2}>
              <Button onClick={handleAdd}>＋</Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Google Map */}
      {isLoaded && inventories.length > 0 && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          center={parseLatLng(inventories[0].location)}
          options={{ mapId: '15eaad764306adc0' }}
          onLoad={async (map) => {
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
            const bounds = new window.google.maps.LatLngBounds();

            inventories.forEach(inv => {
              const { lat, lng } = parseLatLng(inv.location);
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
