import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { useUser } from '../context/UserContext';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;
  const { setCurrentUser } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // ✅ Set current user immediately after registration
        setCurrentUser(data.user || {
          username: form.username,
          email: form.email,
          role: 'customer',
        });
  
        setForm({ username: '', email: '', password: '' });
        setModalMessage(data.message || 'Registration successful!');
        setShowModal(true);
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
  
  

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/'); // Redirect to homepage after successful login
  };
  

  return (
    <Container className="register-page">
      <div className="register-card">
        <h2>Register</h2>
        <Form className="register-form" onSubmit={handleSubmit}>
          <Form.Group className="form-group" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" value={form.username} onChange={handleChange} required placeholder="Enter your username"/>
          </Form.Group>

          <Form.Group className="form-group" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email"/>
          </Form.Group>

          <Form.Group className="form-group" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Create a password"/>
          </Form.Group>

          <Button type="submit" className="register-btn">Register</Button>
        </Form>
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
    </Container>
  );
}
