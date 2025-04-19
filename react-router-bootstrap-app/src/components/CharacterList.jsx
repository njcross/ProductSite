// src/components/CharacterList.jsx
import { useState, useEffect, useCallback } from 'react';
import SuperheroCard from './SuperheroCard';
import CharacterForm from './CharacterForm';
import ConfirmationModal from './ConfirmationModal';
import PaginationControls from './PaginationControls';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './CharacterList.css';

export default function CharacterList({ itemsPerPage = 12, sortBy = 'name', view = 'grid', search = '' }) {
  const { currentUser } = useUser();
  const [characters, setCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchCharacters = useCallback(() => {
    fetch(`${API_BASE}/characters?sortBy=${sortBy}&page=${page}&perPage=${itemsPerPage}&search=${encodeURIComponent(search || '')}`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        credentials: 'include'
      }
    })
      .then(res => res.json())
      .then(data => {
        setCharacters(data.characters || data);
        setHasNext(data.has_next ?? (data.length === itemsPerPage));
      })
      .catch(err => console.error('Failed to load characters:', err));
  }, [API_BASE, sortBy, page, itemsPerPage, search]);
  

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleDelete = (id) => {
    fetch(`${API_BASE}/characters/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include' },
    })
      .then(() => {
        setModalMessage('Character deleted successfully!');
        setIsSuccess(true);
        setShowModal(true);
        fetchCharacters();  // 🔁 Re-fetch instead of filtering locally
      })
      .catch(err => {
        console.error('Failed to delete:', err);
        setModalMessage('Failed to delete character.');
        setIsSuccess(false);
        setShowModal(true);
      });
  };

  const handleEditClick = (character) => {
    navigate(`/edit/${character.id}`);
  };

  const handleCreate = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/characters`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json', credentials: 'include' },
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
    fetchCharacters();
  };

  return (
    <div className={`character-list-container ${view === 'list' ? 'list-view' : ''}`}>
      {currentUser?.role === 'admin' && (
        <Row>
        <Col className="d-flex justify-content-end mb-3">
          <Button variant="danger" onClick={() => setShowCreate(true)}>
            Add New Character
          </Button>
        </Col>
      </Row>
      )}

<Row className={`character-row d-flex ${view === 'list' ? 'flex-column' : 'justify-content-center'}`}>
  {characters.map(char => (
    <Col
      key={char.id}
      xs={12}
      sm={view === 'grid' ? 6 : 12}
      md={view === 'grid' ? 4 : 12}
      lg={view === 'grid' ? 3 : 12}
      className="character-card-wrapper"
    >
      <SuperheroCard
        character={char}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />
    </Col>
  ))}
</Row>

<div className="pagination-controls">
<Row className="mt-4">
  <Col className="d-flex justify-content-center">
    <PaginationControls
      page={page}
      onPageChange={setPage}
      hasNext={hasNext}
    />
  </Col>
</Row>
</div>


      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Character</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CharacterForm onSubmit={handleCreate} />
        </Modal.Body>
      </Modal>

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
