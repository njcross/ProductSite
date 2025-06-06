import { useState } from 'react';
import { setToken } from '../utils/tokenService';


import EditableField from '../components/EditableField';import { useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './Login.css';
import DividerWithText from '../components/DividerWithText';

export default function Login() {
  const { setCurrentUser } = useUser()
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { credentials: 'include', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful!');
        setToken(data.token);
        setCurrentUser(data.user);
        navigate('/cards');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Something went wrong.');
    }
  };

  return (
    <Container className="login-page">
      <Helmet>
              <title>Log In – My Play Trays</title>
              <meta name="description" content="Access your Play Trays account." />
            </Helmet>
      <div className="login-card">
        <h2>{<EditableField contentKey="content_56" />}</h2>
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Group className="mb-3">
            <Form.Label>{<EditableField contentKey="content_131" />}</Form.Label>
            <Form.Control
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>{<EditableField contentKey="content_132" />}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </Form.Group>

          <div className="text-end mb-3">
            <a href="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="login-btn">
            {<EditableField contentKey="content_56" />}
          </Button>

          {message && <p className="mt-3 text-light">{message}</p>}
          <DividerWithText text="OR" />
          <GoogleSignInButton className="google-signin-btn" />
        </Form>

      </div>
    </Container>
  );
}
