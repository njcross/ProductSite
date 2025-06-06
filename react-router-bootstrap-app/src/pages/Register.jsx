import { useState } from 'react';
import EditableField from '../components/EditableField';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { useUser } from '../context/UserContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './Register.css';
import { setToken } from '../utils/tokenService';
import DividerWithText from '../components/DividerWithText';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState('');
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [canRestoreUser, setCanRestoreUser] = useState(null);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;
  const { setCurrentUser } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const checkDeletedAccount = async () => {
    const res = await fetch(`${API_BASE}/api/check-email-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email })
    });

    const data = await res.json();

    if (data.exists && !data.active) {
      setCanRestoreUser(data);
      setShowRestorePrompt(true);
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    const deleted = await checkDeletedAccount();
    if (deleted) return; // wait for user confirmation

    registerUser();
  };

  const registerUser = async (restore = false) => {
    try {
      const payload = { ...form, restore }; // include restore flag for backend
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: {
          credentials: 'include',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setCurrentUser(data.user || {
          username: form.username,
          email: form.email,
          role: 'customer',
        });

        setForm({ username: '', email: '', password: '', confirmPassword: '' });
        setError('');
        setModalMessage(data.message || 'Registration successful!');
        setShowModal(true);
        navigate('/cards');
      } else {
        setModalMessage(data.message || 'Registration failed.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setModalMessage('An error occurred. Please try again.');
      setShowModal(true);
    }
  };

  const handleRestoreDecision = (restore) => {
    setShowRestorePrompt(false);
    registerUser(restore);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <Container className="register-page">
      <Helmet>
        <title>Sign Up – My Play Tray</title>
        <meta name="description" content="Create your account and start your exploring our Play Trays." />
      </Helmet>
      <div className="register-card">
        <h2>{<EditableField contentKey="content_58" />}</h2>
        <Form className="register-form" onSubmit={handleSubmit}>
          <Form.Group className="form-group" controlId="username">
            <Form.Label>{<EditableField contentKey="content_131" />}</Form.Label>
            <Form.Control name="username" value={form.username} onChange={handleChange} required placeholder="Enter your username" />
          </Form.Group>

          <Form.Group className="form-group" controlId="email">
            <Form.Label>{<EditableField contentKey="content_139" />}</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
          </Form.Group>

          <Form.Group className="form-group" controlId="password">
            <Form.Label>{<EditableField contentKey="content_132" />}</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Create a password" />
          </Form.Group>

          <Form.Group className="form-group" controlId="confirmPassword">
            <Form.Label>{<EditableField contentKey="register_confirm" />}</Form.Label>
            <Form.Control type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" />
          </Form.Group>

          {error && <p className="error-message">{error}</p>}

          <Button type="submit" className="register-btn" data-testid="register-submit">{<EditableField contentKey="content_58" />}</Button>
        </Form>
        <div className="google-signin-section">
          <DividerWithText text="OR" />
          <GoogleSignInButton />
        </div>
      </div>

      <ConfirmationModal
        show={showModal}
        title="Registration"
        message={modalMessage}
        onHide={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        confirmText="Go to Home"
        cancelText=""
      />

      <ConfirmationModal
        show={showRestorePrompt}
        title="Reactivate Account?"
        message={`An account with this email already exists but was deactivated. Would you like to restore it?`}
        onHide={() => setShowRestorePrompt(false)}
        onConfirm={() => handleRestoreDecision(true)}
        onCancel={() => handleRestoreDecision(false)}
        confirmText="Restore Account"
        cancelText="Create New"
      />
    </Container>
  );
}
