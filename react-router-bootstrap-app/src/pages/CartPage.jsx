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
  }, [currentUser]);

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

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('You must be logged in to checkout.');
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
          const err = await decrementRes.json();
          alert(`Inventory issue for ${item.kit?.name || 'item'}: ${err.error || 'Unavailable'}`);
          continue;
        }

        if (location_name.toLowerCase() === 'warehouse') {
          warehouse.push({ kit_id, quantity, inventory_id, cartId: id });
        } else {
          pickups.push({ kit_id, quantity, inventory_id, cartId: id });
        }
      }
      if (warehouse.length > 0) {
        const kitName = cart.find(i => i.id === warehouse[0].cartId)?.kit?.name || 'Kit';
        setSelectedKitName(kitName);
        setWarehouseItems(warehouse);
        setShowBillingModal(true);
      } 
      if (pickups.length > 0) {
        const kitName = cart.find(i => i.id === warehouse[0].cartId)?.kit?.name || 'Kit';
        setSelectedKitName(kitName);
        setShowBillingModal(true);
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed: ' + err.message);
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
          onHide={() => setShowBillingModal(false)}
          cart={cart}
          total={total}
          includeShipping={warehouse.length > 0}
          onSuccess={() => {
            clearCart();
            setShowBillingModal(false);
          }}
        />

      )}
    </Container>
  );
}
