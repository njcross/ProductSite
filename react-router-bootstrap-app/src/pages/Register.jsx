import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch('http://localhost:5000:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setForm({ username: '', email: '', password: '' }); // Clear form
        setModalMessage(data.message || 'Registration successful!');
      } else {
        setModalMessage(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setModalMessage('An error occurred. Please try again.');
    }
  
    setShowModal(true);
  };
  

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/'); // Go to homepage after confirmation
  };

  return (
    <Container className="register-page">
      <div className="register-card">
        <h2>Register</h2>
        <Form className="register-form" onSubmit={handleSubmit}>
          <Form.Group className="form-group" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" value={form.username} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="form-group" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="form-group" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
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
