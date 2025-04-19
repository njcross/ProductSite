import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col, Card } from 'react-bootstrap';
import CharacterForm from '../components/CharacterForm';
import ConfirmationModal from '../components/ConfirmationModal';
import './EditCharacterPage.css';

export default function EditCharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [character, setCharacter] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5000/characters/${id}`)
      .then(res => res.json())
      .then(data => setCharacter(data))
      .catch(err => console.error('Error fetching character:', err));
  }, [id, refreshCount]);

  const handleModalClose = () => {
    setShowModal(false);
    setRefreshCount(prev => prev + 1);
  };

  const handleEditButtonClick = () => {
    setShowEditForm(true); // Show the form when "Edit" button is clicked
  };

  const handleEditSubmit = async (updatedCharacter) => {
    try {
      const res = await fetch(`http://localhost:5000/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCharacter)
      });

      if (res.ok) {
        setIsSuccess(true);
        setModalMessage('Character updated successfully!');
        setShowEditForm(false); // Hide the form after successful update
      } else {
        setIsSuccess(false);
        setModalMessage('Failed to update character.');
      }
    } catch (err) {
      setIsSuccess(false);
      setModalMessage('Error updating character.');
    } finally {
      setShowModal(true); // Show confirmation modal after submitting
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    navigate('/cards'); // Redirect to character list after confirmation
  };

  if (!character) {
    return <div>Loading...</div>; // Loading state while fetching character data
  }

  return (
    <Container className="edit-character-page mt-4">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
  ← Back
</Button>
  <Row className="justify-content-center">
    <Col md={6}>
      <Card className="edit-character-card">
        <Card.Img variant="top" src={character.image_url} alt={character.name} />
        <Card.Body>
          <Card.Title>{character.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{character.alias}</Card.Subtitle>
          <Card.Text>
            <strong>Alignment:</strong> {character.alignment}<br />
            <strong>Powers:</strong> {character.powers}
          </Card.Text>
          <Button variant="warning" onClick={handleEditButtonClick}>
            Edit Character
          </Button>
        </Card.Body>
      </Card>
    </Col>
  </Row>


      {/* Character Edit Form Modal */}
      <Modal show={showEditForm} onHide={() => setShowEditForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Character</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CharacterForm
            initialData={character}
            onSubmit={handleEditSubmit}
          />
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal for Success or Error */}
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
