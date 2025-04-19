import { useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Form, Button, Card, Container } from 'react-bootstrap';
import './ContactForm.css';

export default function ContactForm() {
  const formRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        'service_7ydgfxh', 
        'template_mv3hwmw', 
        formRef.current, 
        '0CX4oaT2Hk1R8XChC'
      )
      .then(() => {
        alert('Message sent!');
        formRef.current.reset();
      })
      .catch((error) => {
        console.error('Failed to send message:', error);
        alert('Error sending message');
      });
  };

  return (
    <Container className="contact-form-wrapper my-5">
      <Card className="contact-card p-4 shadow-lg">
        <h2 className="text-center mb-4">Contact Me</h2>
        <Form ref={formRef} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="full-name">
            <Form.Label>Full Name / Company</Form.Label>
            <Form.Control type="text" name="from_name" placeholder="Enter your full name" required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Your Email</Form.Label>
            <Form.Control type="email" name="reply_to" placeholder="Enter your email" required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="phone">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control type="tel" name="phone" placeholder="10-digit phone" pattern="[0-9]{10}" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="message">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" name="message" rows={5} required />
          </Form.Group>

          <div className="text-center">
            <Button type="submit" variant="primary" className="w-50">Send</Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
