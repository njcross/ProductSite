import { useState, useEffect, useCallback } from 'react';
import SuperheroCard from './SuperheroCard';
import CharacterForm from './CharacterForm';
import ConfirmationModal from './ConfirmationModal';
import PaginationControls from './PaginationControls';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import './CharacterList.css';

export default function CharacterList({
  itemsPerPage = 12,
  sortBy = 'name',
  sortDir = 'asc',
  view = 'grid',
  search = '',
  selectedAges = [],
  selectedCategories = [],
  selectedThemes = [],
  selectedGrades = [],
  rating = '',
  locations = [],
  page,
  onPageChange
}) {
  const { currentUser } = useUser();
  const [characters, setCharacters] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchCharacters = useCallback(async () => {
    let url = `${API_BASE}/api/kits?sortBy=${sortBy}&sortDir=${sortDir}&page=${page}&perPage=${itemsPerPage}&search=${encodeURIComponent(search || '')}`;
  
    if (rating) url += `&min_rating=${rating}`;
    if (locations?.length) url += `&locations=${locations.join(',')}`;
    if (Array.isArray(selectedAges) && selectedAges.length)
      url += `&age_ids=${selectedAges.join(',')}`;
    if (Array.isArray(selectedCategories) && selectedCategories.length)
      url += `&category_ids=${selectedCategories.join(',')}`;
    if (Array.isArray(selectedThemes) && selectedThemes.length)
      url += `&theme_ids=${selectedThemes.join(',')}`;
    if (Array.isArray(selectedGrades) && selectedGrades.length)
      url += `&grade_ids=${selectedGrades.join(',')}`;
  
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setCharacters(data.characters || data);
      setHasNext(data.has_next ?? (data.length === itemsPerPage));
    } catch (err) {
      console.error('Failed to load characters:', err);
    }
  }, [
    API_BASE,
    sortBy,
    sortDir,
    page,
    itemsPerPage,
    search,
    rating,
    locations,
    selectedAges,
    selectedCategories,
    selectedThemes,
    selectedGrades,
  ]);
  
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);
  
  const handleDelete = (id) => {
    fetch(`${API_BASE}/api/kits/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {
        setModalMessage('Character deleted successfully!');
        setIsSuccess(true);
        setShowModal(true);
        fetchCharacters(); // ✅ will now correctly refer to the memoized version
      })
      .catch(err => {
        console.error('Failed to delete:', err);
        setModalMessage('Failed to delete character.');
        setIsSuccess(false);
        setShowModal(true);
      });
  };
  
  

  const handleEditClick = (character) => {
    window.scrollTo(0, 0);
    navigate(`/edit/${character.id}`);
  };

  const handleCreate = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/api/kits`, {
        method: 'POST',
        credentials: 'include',
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
    fetchCharacters();
  };

  return (
    <div className={`character-list-container ${view === 'list' ? 'list-view' : ''}`}>
      {currentUser?.role === 'admin' && (
        <Row>
          <Col className="d-flex justify-content-end mb-3">
            <Button variant="danger" onClick={() => setShowCreate(true)}>
              <EditableField contentKey="content_11" />
            </Button>
          </Col>
        </Row>
      )}

      <div className={`character-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
        {characters.map(char => (
          <div key={char.id} className="character-card-wrapper">
            <SuperheroCard
              character={char}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <PaginationControls
              page={page}
              onPageChange={onPageChange}
              hasNext={hasNext}
            />
          </Col>
        </Row>
      </div>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><EditableField contentKey="content_11" /></Modal.Title>
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
