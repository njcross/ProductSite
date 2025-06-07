import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function BillingModal({ show, onHide, onSuccess, cart, total }) {
  const stripe = useStripe();
  const elements = useElements();

  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
      billing_details: {
        name: billingInfo.name,
        email: billingInfo.email,
        address: {
          line1: billingInfo.line1,
          city: billingInfo.city,
          state: billingInfo.state,
          postal_code: billingInfo.postal_code,
          country: billingInfo.country
        }
      }
    });

    if (error) {
      alert(error.message);
      return;
    }

    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/purchases`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart,
        billingInfo,
        payment_method_id: paymentMethod.id
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Payment failed');
      return;
    }

    onSuccess();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Billing Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={12}>
              {['name', 'email', 'line1', 'city', 'state', 'postal_code', 'country'].map(field => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field.replace('_', ' ').toUpperCase()}</Form.Label>
                  <Form.Control
                    type="text"
                    name={field}
                    value={billingInfo[field]}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              ))}
              <Form.Group className="mb-3">
                <Form.Label>Card Info</Form.Label>
                <CardElement options={{ hidePostalCode: true }} />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Submit Payment</Button>
      </Modal.Footer>
    </Modal>
  );
}
