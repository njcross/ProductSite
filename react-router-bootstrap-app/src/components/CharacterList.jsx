import { useState, useEffect } from 'react';
import SuperheroCard from './SuperheroCard';
import CharacterForm from './CharacterForm';
import ConfirmationModal from './ConfirmationModal';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './CharacterList.css';

export default function CharacterList() {
  const [characters, setCharacters] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const fetchCharacters = () => {
    fetch('http://127.0.0.1:5000/characters')
      .then(res => res.json())
      .then(data => setCharacters(data))
      .catch(err => console.error('Failed to load characters:', err));
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:5000/characters/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setCharacters(prev => prev.filter(char => char.id !== id));
        setModalMessage('Character deleted successfully!');
        setIsSuccess(true);
        setShowModal(true);
      })
      .catch(err => {
        console.error('Failed to delete:', err);
        setModalMessage('Failed to delete character.');
        setIsSuccess(false);
        setShowModal(true);
      });
  };

  const handleEditClick = (character) => {
    navigate(`/edit/${character.id}`); // Navigate to the edit page
  };

  const handleCreate = async (formData) => {
    try {
      const res = await fetch('http://localhost:5000/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create character.');
      }

      const newChar = await res.json();
      setCharacters(prev => [...prev, newChar]);
      setModalMessage('Character created successfully!');
      setIsSuccess(true);
    } catch (error) {
      console.error('Create Error:', error);
      setModalMessage(`Error: ${error.message}`);
      setIsSuccess(false);
    } finally {
      setShowModal(true);
      setShowCreate(false);
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    fetchCharacters(); // Refresh character list
  };

  return (
    <div className="character-list-container">
      <div className="d-flex justify-content-end mb-3">
        <Button variant="danger" onClick={() => setShowCreate(true)}>
          Add New Character
        </Button>
      </div>

      <Row className="d-flex justify-content-center">
        {characters.map(char => (
          <Col key={char.id} sm={12} md={6} lg={4} xl={3} className="character-card-wrapper ">
            <SuperheroCard
              character={char}
              onEdit={handleEditClick}  
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      {/* Create Character Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Character</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CharacterForm onSubmit={handleCreate} />
        </Modal.Body>
      </Modal>

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        title={isSuccess ? 'Success' : 'Error'}
        message={modalMessage}
        onHide={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}
