import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col } from 'react-bootstrap';

import EditableField from '../components/EditableField';
import EditableImage from '../components/EditableImage';
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
    fetch(`${API_BASE}/characters/${id}`, {
      'ngrok-skip-browser-warning': 'true',
      credentials: 'include',
      headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include' }
    })
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
        body: JSON.stringify(updatedCharacter),
        'ngrok-skip-browser-warning': 'true',
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
          <p className="character-alias">
            <EditableField contentKey="content_109" /> <strong>{character.alias}</strong>
          </p>
          <hr />
          <p className="character-alignment">
            <strong><EditableField contentKey="content_110" /></strong> {character.alignment}
          </p>
          <p className="character-powers">
            <strong><EditableField contentKey="content_111" /></strong> {character.powers}
          </p>
          <p className="character-price">
            <strong><EditableField contentKey="content_112" /></strong> {character.price}
          </p>

          {currentUser?.role === 'admin' && (
            <>
              <Button variant="warning" className="edit-button" onClick={handleEditButtonClick}>
                <EditableField contentKey="content_113" />
              </Button>
              <EditableField contentKey="content_12" />
            </>
          )}
        </Col>
      </Row>

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
