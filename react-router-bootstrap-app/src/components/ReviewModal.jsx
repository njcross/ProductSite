import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import StarRating from './StarRating';

export default function ReviewForm({ show, onHide, kitId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ageId, setAgeId] = useState('');
  const [lengthOfPlay, setLengthOfPlay] = useState('');
  const [ageOptions, setAgeOptions] = useState([]);

  const lengthOptions = ['<15 mins', '15-30 mins', '30-45 mins', '45+ mins'];
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`)
      .then(res => res.json())
      .then(setAgeOptions)
      .catch(console.error);
  }, [API_BASE]);

  const handleSubmit = () => {
    onSubmit({ rating, comment, age_id: ageId, length_of_play: lengthOfPlay });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Leave a Review</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Rating</Form.Label>
            <StarRating rating={rating} setRating={setRating} editable />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Age</Form.Label>
            <Form.Select value={ageId} onChange={e => setAgeId(e.target.value)}>
              <option value="">Select Age</option>
              {ageOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Length of Play</Form.Label>
            <Form.Select value={lengthOfPlay} onChange={e => setLengthOfPlay(e.target.value)}>
              <option value="">Select Length</option>
              {lengthOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!rating || !ageId || !lengthOfPlay}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
