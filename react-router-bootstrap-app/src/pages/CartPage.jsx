// CartPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getAddressFromLatLng } from '../utils/googleApiService';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    line1: '', city: '', state: '', postal_code: '', country: ''
  });
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [addressMap, setAddressMap] = useState({});

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
    const coordinates = item.inventory?.coordinates || null;
    const inventory_id = item.inventory?.id || null;

    return {
      id: item.id,
      kit_id: kit.id || item.kit_id,
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
    
      try {
        for (const item of cart) {
          const { kit_id, quantity, inventory_id, location, id } = getDetails(item);
          const location_name = item.inventory?.location_name || '';
    
          const decrementRes = await fetch(`${API_BASE}/api/inventory/decrement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ kit_id, location, location_name }),
          });
    
          if (!decrementRes.ok) {
            const err = await decrementRes.json();
            alert(`Inventory issue for ${item.kit?.name || 'item'}: ${err.error || 'Unavailable'}`);
            continue;
          }
          // Stripe logic after all inventory checks are done
          // const stripeRes = await fetch(`${API_BASE}/create-checkout-session`, {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   credentials: 'include',
          //   body: JSON.stringify({
          //     items: cart,
          //     userEmail: currentUser?.email,
          //     shippingAddress: {
          //       line1: '123 Main St', // You can customize this with a form later
          //       city: 'Anytown',
          //       state: 'CA',
          //       postal_code: '90210',
          //       country: 'US',
          //     },
          //   }),
          // });

          // if (!stripeRes.ok) {
          //   const err = await stripeRes.json();
          //   alert(`Stripe Checkout Error: ${err.error || 'Something went wrong'}`);
          //   // add back the inventory if Stripe fails
          //   const incrementRes = await fetch(`${API_BASE}/api/inventory/increment`, {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     credentials: 'include',
          //     body: JSON.stringify({ kit_id, location }),
          //   });
          //   return;
          // }

          
          // const { sessionId } = await stripeRes.json();
          // const stripe = await window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
          // await stripe.redirectToCheckout({ sessionId });
    
          if (location_name.toLowerCase() === 'warehouse') {
            warehouse.push({ kit_id, quantity, inventory_id, cartId: id });
            continue;
          }
    
          const res = await fetch(`${API_BASE}/api/purchases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ kit_id, quantity, inventory_id }),
          });
    
          if (!res.ok) {
            alert(`Purchase failed for ${item.kit?.name || 'item'}`);
            throw new Error(`${item.kit?.name || 'item'}`);
          } else {
            removeFromCart(id);
          }
        }
    
        if (warehouse.length > 0) {
          setWarehouseItems(warehouse);
          setShowShippingModal(true);
        } else {
          navigate('/orders');
        }
      } catch (err) {
        console.error('Checkout failed:', err);
        alert('Checkout failed: ' + err.message);
      }
    };
    
    
``
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
          {/* Table Headers */}
          <div className="cart-headers">
            <div className="cart-col image-col"></div>
            <div className="cart-col name-col"><EditableField contentKey="content_238" /></div>
            <div className="cart-col quantity-col"><EditableField contentKey="content_239" /></div>
            <div className="cart-col total-col"><EditableField contentKey="content_240" /></div>
            <div className="cart-col location-col"><EditableField contentKey="content_250" defaultText="Location" /></div>
            <div className="cart-col action-col"></div>
          </div>

          {/* Cart Items */}
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
                  {details.location }
                </div>
                <div className="cart-col action-col" onClick={(e) => e.stopPropagation()}>
                  <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Total and Buttons */}
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
      {showShippingModal && (
  <div className="shipping-modal">
    <h5>Select a Shipping Address</h5>
    <Form.Select
      className="mb-3"
      value={selectedAddressId || ''}
      onChange={(e) => setSelectedAddressId(e.target.value)}
    >
      <option value="">-- Select Saved Address --</option>
      {shippingAddresses.map(addr => (
        <option key={addr.id} value={addr.id}>
          {addr.line1}, {addr.city}, {addr.state}
        </option>
      ))}
    </Form.Select>

    <h6>Or Enter New Address</h6>
    {['line1', 'city', 'state', 'postal_code', 'country'].map((field) => (
      <Form.Control
        key={field}
        className="mb-2"
        placeholder={field.replace('_', ' ')}
        value={newAddress[field]}
        onChange={(e) => setNewAddress(prev => ({ ...prev, [field]: e.target.value }))}
      />
    ))}

    <Button className="mt-3" onClick={async () => {
      let shipping_address_id = selectedAddressId;

      if (!shipping_address_id) {
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
            shipping_address_id,
          }),
        });

        if (!res.ok) {
          alert(`Warehouse purchase failed`);
        } else {
          removeFromCart(item.cartId);
        }
      }

      setShowShippingModal(false);
      navigate('/orders');
    }}>
      Confirm Shipping & Complete Warehouse Purchase
    </Button>
  </div>
)}

    </Container>
  );
}
