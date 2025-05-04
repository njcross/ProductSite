import { useNavigate } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const getDetails = (item) => {
    const kit = item.kit || item;
    return {
      id: item.id,
      kit_id: kit.id || item.kit_id,
      name: kit.name || 'Unnamed',
      image_url: kit.image_url || '',
      price: kit.price || 0,
      quantity: item.quantity || 1,
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

    try {
      for (const item of cart) {
        const { kit_id, quantity } = getDetails(item);
        await fetch(`${API_BASE}/api/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ kit_id, quantity }),
        });
      }

      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
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
          <div className="cart-headers d-flex">
            <div className="cart-col" style={{ flex: '20%' }}></div>
            <div className="cart-col name-col" style={{ flex: '30%' }}>
              <EditableField contentKey="content_238" />
            </div>
            <div className="cart-col" style={{ flex: '20%' }}>
              <EditableField contentKey="content_239" />
            </div>
            <div className="cart-col price-col" style={{ flex: '20%' }}>
              <EditableField contentKey="content_240" />
            </div>
            <div className="cart-col" style={{ flex: '10%' }}></div>
          </div>

          {cart.map((item) => {
            const details = getDetails(item);
            return (
              <div
                className="cart-item d-flex"
                key={item.id}
                onClick={() => navigate(`/edit/${details.kit_id}`)}
              >
                <div className="cart-col" style={{ flex: '20%' }}>
                  <img src={details.image_url} alt={details.name} />
                </div>
                <div className="cart-col name-col" style={{ flex: '30%' }}>
                  <h5>{details.name}</h5>
                </div>
                <div className="cart-col" style={{ flex: '20%' }} onClick={(e) => e.stopPropagation()}>
                  <Form.Control
                    type="number"
                    min={1}
                    value={details.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  />
                </div>
                <div className="cart-col price-col" style={{ flex: '20%' }} onClick={(e) => e.stopPropagation()}>
                  ${(details.quantity * details.price).toFixed(2)}
                </div>
                <div className="cart-col" style={{ flex: '10%' }} onClick={(e) => e.stopPropagation()}>
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
    </Container>
  );
}
