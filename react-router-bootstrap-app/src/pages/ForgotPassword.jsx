import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error('Error sending forgot password request', err);
    }
    setSubmitted(true);
  };

  return (
    <Container className="forgot-password-page">
      <Helmet>
        <title>Forgot Password – My Play Trays</title>
        <meta name="description" content="Reset your password via email link." />
      </Helmet>

      <div className="forgot-password-card">
        <h2><EditableField contentKey="content_forgot_password" defaultText="Forgot Your Password?" /></h2>
        <p><EditableField contentKey="content_email_forgot" defaultText="Enter your email to receive a reset link. If your account exists, you'll get an email." /></p>

        {submitted ? (
          <Alert variant="success" className="mt-4">
            <EditableField
              contentKey="content_reset_sent"
              defaultText="If an account exists for the provided email, a reset link has been sent."
            />
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} className="forgot-password-form mt-4">
            <Form.Group controlId="formEmail">
              <Form.Label><EditableField contentKey="content_forgo_input" defaultText="Email Address" /></Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" className="mt-3 btn btn-primary">
              <EditableField contentKey="content_send_reset" defaultText="Send Reset Link" />
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
}
