import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col, Form } from 'react-bootstrap';

import EditableField from '../components/EditableField';
import CharacterForm from '../components/CharacterForm';
import ConfirmationModal from '../components/ConfirmationModal';
import InventorySection from '../components/InventorySection';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';

import './EditCharacterPage.css';
import StarRating from '../components/StarRating';

export default function EditCharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { addToCart } = useCart();
  const API_BASE = process.env.REACT_APP_API_URL;

  const [character, setCharacter] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [userAgeIds, setUserAgeIds] = useState([]);
  const [lengthOfPlay, setLengthOfPlay] = useState('');
  const [ageOptions, setAgeOptions] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedInventoryId, setSelectedInventoryId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(setCharacter)
      .catch(err => console.error('Error fetching character:', err));
  }, [id, refreshCount, API_BASE]);

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`)
      .then(res => res.json())
      .then(setAgeOptions)
      .catch(console.error);
  }, [API_BASE]);

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
            setUserAgeIds(existing.age?.map(a => a.id) || []);
            setLengthOfPlay(existing.length_of_play || '');
          }
        }
      })
      .catch(err => console.error('Error fetching reviews:', err));
  }, [id, refreshCount, API_BASE, currentUser]);

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

  const handleAddToCart = async () => {
  try {
    await addToCart(character, selectedInventoryId);
    window.scrollTo(0, 0);
    navigate('/cart');
  } catch (err) {
    if (err.message === 'User cancelled inventory selection') {
      // ❌ don't alert, don't navigate
      return;
    }
    alert(err.message || 'Failed to add to cart');
  }
};


  const handleModalConfirm = () => {
    setShowModal(false);
    if (isSuccess) {
      window.scrollTo(0, 0);
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
        body: JSON.stringify({
          rating: userRating,
          comment: userComment,
          age_ids: userAgeIds,
          length_of_play: lengthOfPlay
        }),
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
      <Helmet>
        <title>Edit My Play Tray: Admin</title>
        <meta name="description" content="Admin tool to update Play kit details." />
      </Helmet>

      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        <EditableField contentKey="content_105" />
      </Button>

      <Row className="character-detail-layout">
        <Col md={6} className="image-section">
          <img src={character.image_url} alt={character.name} className="character-img-large" />
        </Col>
        <Col md={6} className="info-section">
          <h1 className="character-title">{character.name}</h1>

          <p><strong><EditableField contentKey="content_200" /></strong> {character.description}</p>
          <p><strong><EditableField contentKey="content_112" /></strong> ${character.price}</p>
          <p><strong><EditableField contentKey="content_201" /></strong> {character.age?.map(a => a.name).join(', ') || 'N/A'}</p>
          <p><strong><EditableField contentKey="content_202" /></strong> {character.category?.map(c => c.name).join(', ') || 'N/A'}</p>

          {currentUser?.role === 'admin' && (
            <Button variant="warning" className="edit-button" onClick={() => setShowEditForm(true)}>
              <EditableField contentKey="content_113" />
            </Button>
          )}

          <InventorySection
            kitId={character.id}
            isAdmin={currentUser?.role === 'admin'}
            selectedInventoryId={selectedInventoryId}
            setSelectedInventoryId={setSelectedInventoryId}
          />

          {currentUser && (
            <Button variant="success" className="mt-2" onClick={handleAddToCart}>
              <EditableField contentKey="content_237" />
            </Button>
          )}
        </Col>
      </Row>

      <hr />
      <div className="rating-section">
        <h3><EditableField contentKey="content_219" /></h3>
        <StarRating rating={character.average_rating || 0} editable={false} />
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
            className="form-control my-2"
          />

          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Select
              multiple
              value={userAgeIds.map(String)}
              onChange={e => setUserAgeIds(Array.from(e.target.selectedOptions, opt => Number(opt.value)))}
            >
              {ageOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Length of Play</Form.Label>
            <Form.Select
              value={lengthOfPlay}
              onChange={e => setLengthOfPlay(e.target.value)}
            >
              <option value="">Select</option>
              <option value="<15 mins">&lt;15 mins</option>
              <option value="15-30 mins">15-30 mins</option>
              <option value="30-45 mins">30-45 mins</option>
              <option value="45+ mins">45+ mins</option>
            </Form.Select>
          </Form.Group>

          <Button
            variant="primary"
            disabled={submittingReview}
            onClick={submitReview}
            className="me-2"
          >
            <EditableField contentKey="content_222" />
          </Button>
          <Button
            variant="danger"
            disabled={submittingReview}
            onClick={async () => {
              if (!window.confirm("Delete your review?")) return;
              await fetch(`${API_BASE}/api/reviews/${id}`, {
                method: 'DELETE',
                credentials: 'include',
              });
              setRefreshCount(c => c + 1);
            }}
          >
            Delete Review
          </Button>
        </>
      )}

      <hr />
      <h4><EditableField contentKey="content_223" /></h4>
      {reviews.map((r, i) => (
        <div key={i} className="review my-3 p-3 border rounded bg-light">
          <strong>
            {r.username}
            {r.verified && (
              <span className="text-success ms-2" title="Verified Purchase">✔️ <small>Verified</small></span>
            )}
          </strong>
          <StarRating rating={r.rating} editable={false} />
          <p>{r.comment}</p>
          {r.age?.length > 0 && <p><strong>Age:</strong> {r.age.map(a => a.name).join(', ')}</p>}
          {r.length_of_play && <p><strong>Length of Play:</strong> {r.length_of_play}</p>}
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
        onHide={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        confirmText={isSuccess ? 'Go to List' : 'Retry'}
        cancelText="Stay on Page"
      />
    </Container>
  );
}
