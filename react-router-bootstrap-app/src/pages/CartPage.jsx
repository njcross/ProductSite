import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  return (
    <Container className="cart-page">
      <h2 className="text-white mb-4">🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-light">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <Row key={item.id} className="cart-item align-items-center mb-3 p-3 rounded">
              <Col xs={3}><img src={item.image_url} alt={item.name} className="img-fluid rounded" /></Col>
              <Col xs={3}>
                <h5 className="text-white">{item.name}</h5>
                <p className="text-muted">{item.alias}</p>
              </Col>
              <Col xs={3}>
                <Form.Control
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                />
              </Col>
              <Col xs={2} className="text-white">${(item.quantity * 19.99).toFixed(2)}</Col>
              <Col xs={1}>
                <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                  <i className="fas fa-trash-alt"></i>
                </Button>
              </Col>
            </Row>
          ))}

          <hr className="text-light" />
          <h4 className="text-white">Total: ${Number(total || 0).toFixed(2)}</h4>
        </>
      )}

      <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
        ← Back
      </Button>
    </Container>
  );
}
