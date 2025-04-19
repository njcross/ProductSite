// CharacterCarousel.jsx
import { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import SuperheroCard from './SuperheroCard';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import './CharacterCarousel.css';

export default function CharacterCarousel() {
  const [characters, setCharacters] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const handleModalConfirm = () => {
    setShowModal(false);
    fetchCharacters(); // Refresh character list
  };

  return (
    <div className="charactert-carousel-container">
    <section className="character-carousel-section">
      <h2 className="carousel-title">Character Cards</h2>
      <Carousel className="character-carousel" interval={3000} fade>
        {characters.map((character) => (
          <Carousel.Item key={character.id}>
            <div className="carousel-card-wrapper">
              <SuperheroCard
                character={character}
                onEdit={handleEditClick}  
              onDelete={handleDelete}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>

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
