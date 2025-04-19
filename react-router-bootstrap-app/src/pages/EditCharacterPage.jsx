import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col } from 'react-bootstrap';
import CharacterForm from '../components/CharacterForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { useUser } from '../context/UserContext';
import './EditCharacterPage.css';

export default function EditCharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useUser();
  const [character, setCharacter] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/characters/${id}`)
      .then(res => res.json())
      .then(data => setCharacter(data))
      .catch(err => console.error('Error fetching character:', err));
  }, [id, refreshCount, API_BASE]);

  const handleModalClose = () => {
    setShowModal(false);
    setRefreshCount(prev => prev + 1);
  };

  const handleEditButtonClick = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = async (updatedCharacter) => {
    try {
      const res = await fetch(`${API_BASE}/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCharacter)
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
    navigate('/cards');
  };

  if (!character) return <div>Loading...</div>;

  return (
    <Container className="edit-character-page">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">← Back</Button>
      <Row className="character-detail-layout">
        <Col md={6} className="image-section">
          <img src={character.image_url} alt={character.name} className="character-img-large" />
        </Col>
        <Col md={6} className="info-section">
          <h1 className="character-title">{character.name}</h1>
          <p className="character-alias">Alias: <strong>{character.alias}</strong></p>
          <hr />
          <p className="character-alignment"><strong>Alignment:</strong> {character.alignment}</p>
          <p className="character-powers"><strong>Powers:</strong> {character.powers}</p>
          <p className="character-price"><strong>Price:</strong> {character.price}</p>
          {(currentUser?.role === 'admin') && (
          <Button variant="warning" className="edit-button" onClick={handleEditButtonClick}>
            ✏️ Edit Character
          </Button>
          )}
        </Col>
      </Row>

      {/* Edit Form Modal */}
      <Modal show={showEditForm} onHide={() => setShowEditForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Character</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CharacterForm initialData={character} onSubmit={handleEditSubmit} />
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
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
