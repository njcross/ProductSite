// components/ShippingModal.jsx
import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import './ShippingModal.css';

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function ShippingModal({
  API_BASE,
  warehouseItems,
  setShowShippingModal,
  shippingAddresses,
  setShippingAddresses,
  removeFromCart,
  navigate,
  setShippingAddressId
}) {
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    line1: '', city: '', state: '', postal_code: '', country: 'United States'
  });

  const handleSubmit = async () => {
    let shipping_address_id = selectedAddressId;

    if (!shipping_address_id) {
      const missing = ['line1', 'city', 'state', 'postal_code', 'country'].filter(f => !newAddress[f]);
      if (missing.length > 0) {
        alert('Please fill in all required address fields.');
        return;
      }

      const res = await fetch(`${API_BASE}/api/shipping-addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAddress),
      });

      if (!res.ok) {
        alert('Failed to create address.');
        return;
      }

      const newAddr = await res.json();
      shipping_address_id = newAddr.id;
      setShippingAddresses(prev => [...prev, newAddr]);
      setShippingAddressId(shipping_address_id);
    }

    for (const item of warehouseItems) {
      const res = await fetch(`${API_BASE}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kit_id: item.kit_id,
          quantity: item.quantity,
          inventory_id: item.inventory_id,
          shipping_address_id
        })
      });

      if (!res.ok) {
        alert(`Warehouse purchase failed`);
      } else {
        removeFromCart(item.cartId);
      }
    }

    setShowShippingModal(false);
    navigate('/orders');
  };

  const kitName = warehouseItems.length > 0 ? `Shipping Address for ${warehouseItems[0].kit_name || 'Kit'}` : 'Shipping Address';

  return (
    <Modal show onHide={() => setShowShippingModal(false)} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{kitName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Select a Saved Address</h6>
        <Form.Select
          className="mb-3"
          value={selectedAddressId || ''}
          onChange={(e) => {
            setSelectedAddressId(e.target.value);
            setShippingAddressId(e.target.value);
          }}
        >
          <option value="">-- Select Saved Address --</option>
          {shippingAddresses.map(addr => (
            <option key={addr.id} value={addr.id}>
              {addr.line1}, {addr.city}, {addr.state}
            </option>
          ))}
        </Form.Select>

        <h6>Or Enter a New Address</h6>
        <Form.Control
          className="mb-2"
          placeholder="Street Address"
          value={newAddress.line1}
          onChange={(e) => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
        />
        <Form.Control
          className="mb-2"
          placeholder="City"
          value={newAddress.city}
          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
        />
        <Form.Select
          className="mb-2"
          value={newAddress.state}
          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
        >
          <option value="">Select State</option>
          {usStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </Form.Select>
        <Form.Control
          className="mb-2"
          placeholder="Postal Code"
          value={newAddress.postal_code}
          onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
        />
        <Form.Select
          className="mb-2"
          value={newAddress.country}
          onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
        >
          <option value="United States">United States</option>
        </Form.Select>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowShippingModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Confirm Shipping & Complete Purchase
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
