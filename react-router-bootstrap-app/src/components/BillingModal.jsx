import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const COUNTRIES = ["US", "CA", "MX", "Other"];

export default function BillingModal({ show, onHide, onSuccess, cart, total, includeShipping = false }) {
  const stripe = useStripe();
  const elements = useElements();

  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
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
          country: billingInfo.country,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const payload = {
      items: cart,
      billing_details: {
        ...billingInfo,
        payment_method_id: paymentMethod.id,
      },
    };

    if (includeShipping && !sameAsBilling) {
      payload.shipping_address = shippingInfo;
    }

    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/purchases`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
        <Form autoComplete="on">
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control name="name" value={billingInfo.name} onChange={handleBillingChange} autoComplete="name" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={billingInfo.email} onChange={handleBillingChange} autoComplete="email" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control name="line1" value={billingInfo.line1} onChange={handleBillingChange} autoComplete="address-line1" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control name="city" value={billingInfo.city} onChange={handleBillingChange} autoComplete="address-level2" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Select name="state" value={billingInfo.state} onChange={handleBillingChange} autoComplete="address-level1" required>
                  <option value="">Choose...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control name="postal_code" value={billingInfo.postal_code} onChange={handleBillingChange} autoComplete="postal-code" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Select name="country" value={billingInfo.country} onChange={handleBillingChange} autoComplete="country" required>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Card Info</Form.Label>
                <CardElement options={{ hidePostalCode: true }} />
              </Form.Group>
            </Col>
          </Row>

          {includeShipping && (
            <>
              <Form.Check
                className="mb-3"
                type="checkbox"
                label="Shipping address same as billing"
                checked={sameAsBilling}
                onChange={() => setSameAsBilling(prev => !prev)}
              />
              {!sameAsBilling && (
                <>
                  <h5>Shipping Address</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control name="name" value={shippingInfo.name} onChange={handleShippingChange} autoComplete="shipping name" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control name="line1" value={shippingInfo.line1} onChange={handleShippingChange} autoComplete="shipping address-line1" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control name="city" value={shippingInfo.city} onChange={handleShippingChange} autoComplete="shipping address-level2" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select name="state" value={shippingInfo.state} onChange={handleShippingChange} autoComplete="shipping address-level1">
                      <option value="">Choose...</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control name="postal_code" value={shippingInfo.postal_code} onChange={handleShippingChange} autoComplete="shipping postal-code" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Select name="country" value={shippingInfo.country} onChange={handleShippingChange} autoComplete="shipping country">
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Submit Payment</Button>
      </Modal.Footer>
    </Modal>
  );
}
