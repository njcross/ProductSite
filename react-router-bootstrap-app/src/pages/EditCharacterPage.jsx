import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col } from 'react-bootstrap';

import EditableField from '../components/EditableField';
import CharacterForm from '../components/CharacterForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { useUser } from '../context/UserContext';
import './EditCharacterPage.css';

const StarRating = ({ rating, setRating, editable = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''} ${editable ? 'editable' : ''}`}
          onClick={() => editable && setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function EditCharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [character, setCharacter] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/${id}`, {
      credentials: 'include',
      headers: { credentials: 'include' }
    })
      .then(res => res.json())
      .then(data => setCharacter(data))
      .catch(err => console.error('Error fetching character:', err));
  }, [id, refreshCount, API_BASE]);

  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/kit/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        if (currentUser) {
          const existing = data.find(r => r.user_id === currentUser.id);
          if (existing) {
            setUserRating(existing.rating);
            setUserComment(existing.comment);
          }
        }
      })
      .catch(err => console.error('Error fetching reviews:', err));
  }, [id, refreshCount, API_BASE, currentUser]);

  const handleModalClose = () => {
    setShowModal(false);
    setRefreshCount(prev => prev + 1);
  };

  const handleEditButtonClick = () => setShowEditForm(true);

  const handleEditSubmit = async (updatedCharacter) => {
    try {
      const res = await fetch(`${API_BASE}/api/kits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCharacter),
        credentials: 'include'
      });

      if (res.ok) {
        setIsSuccess(true);
        setModalMessage('Character updated successfully!');
        setShowEditForm(false);
      } else {
        setIsSuccess(false);
        setModalMessage('Failed to update character.');
      }
    } catch (err) {
      setIsSuccess(false);
      setModalMessage('Error updating character.');
    } finally {
      setShowModal(true);
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    if (isSuccess) {
      navigate('/cards');
    } else {
      setShowEditForm(true);
    }
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: userRating, comment: userComment }),
      });
      if (res.ok) setRefreshCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!character) return <div><EditableField contentKey="content_106" /></div>;

  return (
    <Container className="edit-character-page">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        <EditableField contentKey="content_105" />
      </Button>
      <Row className="character-detail-layout">
        <Col md={6} className="image-section">
          <img src={character.image_url} alt={character.name} className="character-img-large" />
        </Col>
        <Col md={6} className="info-section">
          <h1 className="character-title">{character.name}</h1>

          <p className="character-description">
            <strong><EditableField contentKey="content_200" /></strong> {character.description}
          </p>

          <p className="character-price">
            <strong><EditableField contentKey="content_112" /></strong> ${character.price}
          </p>

          <p className="character-age">
            <strong><EditableField contentKey="content_201" /></strong>{' '}
            {character.age?.map(a => a.name).join(', ') || 'N/A'}
          </p>

          <p className="character-category">
            <strong><EditableField contentKey="content_202" /></strong>{' '}
            {character.category?.map(c => c.name).join(', ') || 'N/A'}
          </p>

          {currentUser?.role === 'admin' && (
            <Button variant="warning" className="edit-button" onClick={handleEditButtonClick}>
              <EditableField contentKey="content_113" />
            </Button>
          )}
        </Col>
      </Row>

      <hr />
      <div className="rating-section">
        <h3><EditableField contentKey="content_219" /></h3>
        <StarRating rating={character.rating || 0} editable={false} />
        {character.review_count > 0 && (
          <p className="text-muted mt-1">
            <strong><EditableField contentKey="content_224" />:</strong> {character.review_count}
          </p>
        )}
      </div>

      {currentUser && (
        <>
          <h4><EditableField contentKey="content_220" /></h4>
          <StarRating rating={userRating} setRating={setUserRating} editable />
          <textarea
            value={userComment}
            onChange={e => setUserComment(e.target.value)}
            rows={3}
            placeholder=""
            className="form-control my-2"
          />
          <Button
            variant="primary"
            disabled={submittingReview}
            onClick={submitReview}
          >
            <EditableField contentKey="content_222" />
          </Button>
        </>
      )}

      <hr />
      <h4><EditableField contentKey="content_223" /></h4>
      {reviews.map((r, i) => (
        <div key={i} className="review my-3 p-3 border rounded bg-light">
          <strong>{r.username}</strong>
          <StarRating rating={r.rating} editable={false} />
          <p>{r.comment}</p>
        </div>
      ))}

      <Modal show={showEditForm} onHide={() => setShowEditForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><EditableField contentKey="content_115" /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CharacterForm initialData={character} onSubmit={handleEditSubmit} />
        </Modal.Body>
      </Modal>

      <ConfirmationModal
        show={showModal}
        title={isSuccess ? 'Success' : 'Error'}
        message={modalMessage}
        onHide={handleModalClose}
        onConfirm={handleModalConfirm}
        confirmText={isSuccess ? 'Go to List' : 'Retry'}
        cancelText="Stay on Page"
      />
    </Container>
  );
}
