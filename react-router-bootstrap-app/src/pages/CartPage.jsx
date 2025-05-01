import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
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
        const { id, quantity } = getDetails(item);
        await fetch(`${API_BASE}/api/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ kit_id: id, quantity }),
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
      <h2 className="text-white mb-4">
        <EditableField contentKey="content_98" />
      </h2>

      {Array.isArray(cart) && cart.length === 0 ? (
        <p className="text-light">
          <EditableField contentKey="content_99" />
        </p>
      ) : (
        <>
          {cart.map((item) => {
            const details = getDetails(item);
            return (
              <Row key={item.id} className="cart-item align-items-center mb-3 p-3 rounded">
                <Col xs={3}>
                  <img src={details.image_url} alt={details.name} className="img-fluid rounded" />
                </Col>
                <Col xs={3}>
                  <h5 className="text-white">{details.name}</h5>
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="number"
                    min={1}
                    value={details.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  />
                </Col>
                <Col xs={2} className="text-white">
                  ${(details.quantity * details.price).toFixed(2)}
                </Col>
                <Col xs={1}>
                  <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </Col>
              </Row>
            );
          })}

          <hr className="text-light" />
          <h4 className="text-white">
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
