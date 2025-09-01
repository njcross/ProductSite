// CartPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet-async';
import { getAddressFromLatLng } from '../utils/googleApiService';
import ShippingModal from '../components/ShippingModal';
import BillingModal from '../components/BillingModal';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedKitName, setSelectedKitName] = useState('');
  const [warehouseItems, setWarehouseItems] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_BASE}/api/shipping-addresses`, { credentials: 'include' })
        .then(res => res.json())
        .then(setShippingAddresses)
        .catch(console.error);
    }
  }, [currentUser, API_BASE]);

  const getDetails = (item) => {
    const kit = item.kit || item;
    const location = item.inventory?.location || null;
    const inventory_id = item.inventory?.id || null;
    return {
      id: item.id,
      kit_id: kit.id || item.kit.id,
      name: kit.name || 'Unnamed',
      image_url: kit.image_url || '',
      price: kit.price || 0,
      quantity: item.quantity || 1,
      location,
      inventory_id
    };
  };

  const total = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        const { price, quantity } = getDetails(item);
        return sum + price * quantity;
      }, 0)
    : 0;
  const handleModalClose = async () => {
    try {
      await fetch(`${API_BASE}/api/inventory/restore-reserved`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: warehouseItems }),
      });
    } catch (err) {
      console.error('Error restoring inventory or deleting Redis key:', err);
    } finally {
      setShowBillingModal(false);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('You must be logged in to checkout.');
      return;
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const warehouse = [];
    const pickups = [];

    try {
      for (const item of cart) {
        const { kit_id, quantity, inventory_id, location, id } = getDetails(item);
        const location_name = item.inventory?.location_name || '';

        const decrementRes = await fetch(`${API_BASE}/api/inventory/decrement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ kit_id, location, location_name, inventory_id, quantity })
        });

        if (!decrementRes.ok) {
          const err = await decrementRes.json().catch(() => ({}));
          alert(`Inventory issue for ${item.kit?.name || 'item'}: ${err.error || 'Unavailable'}`);
          continue;
        }

        // Store the cart *item* id so we can look up its name later
        const entry = { kit_id, quantity, inventory_id, cartId: id };

        if (location_name.toLowerCase() === 'warehouse') {
          warehouse.push(entry);
        } else {
          pickups.push(entry);
        }
      }

      // If anything reserved from warehouse, we’ll include it for shipping
      if (warehouse.length > 0) {
        const firstId = warehouse[0].cartId;
        const kitName = cart.find(i => i.id === firstId)?.kit?.name || 'Kit';
        setSelectedKitName(kitName);
        setWarehouseItems(warehouse);
        setShowBillingModal(true);
        return;
      }

      // Otherwise if there are pickup items only, show billing (no shipping items)
      if (pickups.length > 0) {
        const firstId = pickups[0].cartId;
        const kitName = cart.find(i => i.id === firstId)?.kit?.name || 'Kit';
        setSelectedKitName(kitName);
        setWarehouseItems([]); // no shipping items for pickup-only checkout
        setShowBillingModal(true);
        return;
      }

      // If nothing made it through (all decrements failed), let the user know
      alert('No items available to checkout after inventory checks.');

    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed: ' + (err?.message || String(err)));
    }
  };


  return (
    <Container className="cart-page">
      <Helmet>
        <title>Your Cart – My Play Trays</title>
        <meta name="description" content="View your selected trays and checkout securely." />
      </Helmet>
      <h2 className="text-white mb-4">
        <EditableField contentKey="content_98" />
      </h2>

      {Array.isArray(cart) && cart.length === 0 ? (
        <p className="text-light">
          <EditableField contentKey="content_99" />
        </p>
      ) : (
        <>
          <div className="cart-headers">
            <div className="cart-col image-col"></div>
            <div className="cart-col name-col"><EditableField contentKey="content_238" /></div>
            <div className="cart-col quantity-col"><EditableField contentKey="content_239" /></div>
            <div className="cart-col total-col"><EditableField contentKey="content_240" /></div>
            <div className="cart-col location-col"><EditableField contentKey="content_250" defaultText="Location" /></div>
            <div className="cart-col action-col"></div>
          </div>

          {cart.map((item) => {
            const details = getDetails(item);
            return (
              <div key={item.id} className="cart-item" onClick={() => navigate(`/edit/${details.kit_id}`)}>
                <div className="cart-col image-col">
                  <img src={details.image_url} alt={details.name} />
                </div>
                <div className="cart-col name-col">
                  <h5>{details.name}</h5>
                </div>
                <div className="cart-col quantity-col" onClick={(e) => e.stopPropagation()}>
                  <Form.Control
                    type="number"
                    min={1}
                    value={details.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  />
                </div>
                <div className="cart-col total-col" onClick={(e) => e.stopPropagation()}>
                  ${(details.quantity * details.price).toFixed(2)}
                </div>
                <div className="cart-col location-col">
                  {details.location}
                </div>
                <div className="cart-col action-col" onClick={(e) => e.stopPropagation()}>
                  <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </div>
              </div>
            );
          })}

          <h4 className="text-white cart-total">
            <EditableField contentKey="content_103" /> ${total.toFixed(2)}
          </h4>

          <div className="mt-4 d-flex gap-3 flex-wrap">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <EditableField contentKey="content_105" />
            </Button>
            <Button variant="success" onClick={handleCheckout}>
              <EditableField contentKey="content_236" />
            </Button>
          </div>
        </>
      )}

      {showBillingModal && (
        <BillingModal
          show={showBillingModal}
          onHide={handleModalClose}
          cart={cart}
          total={total}
          includeShipping={warehouseItems}
          onSuccess={() => {
            clearCart();
            setShowBillingModal(false);
            navigate('/orders');
          }}
        />

      )}
    </Container>
  );
}
