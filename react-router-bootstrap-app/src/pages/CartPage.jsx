import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Helper to safely extract character details from either structure
  const getDetails = (item) => {
    const character = item.character || item; // fallback to flat format
    return {
      id: item.id,
      name: character.name || 'Unnamed',
      alias: character.alias || '',
      image_url: character.image_url || '',
      price: character.price || 0,
      quantity: item.quantity || 1,
    };
  };

  const total = Array.isArray(cart)
  ? cart.reduce((sum, item) => {
      const { price, quantity } = getDetails(item);
      return sum + price * quantity;
    }, 0)
  : 0;


  return (
    <Container className="cart-page">
      <h2 className="text-white mb-4">🛒 Your Cart</h2>

      {Array.isArray(cart) && cart.length === 0 ? (
  <p className="text-light">Your cart is empty.</p>
) : (
  <>
    {Array.isArray(cart) && cart.map((item) => {
      const details = getDetails(item);
      return (
        <Row key={item.id} className="cart-item align-items-center mb-3 p-3 rounded">
          <Col xs={3}>
            <img src={details.image_url} alt={details.name} className="img-fluid rounded" />
          </Col>
          <Col xs={3}>
            <h5 className="text-white">{details.name}</h5>
            <p className="text-white">{details.alias}</p>
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
      Total: ${total.toFixed(2)}
    </h4>
  </>
)}


      <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
        ← Back
      </Button>
    </Container>
  );
}
