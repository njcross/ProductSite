// CharacterCarousel.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';

import SuperheroCard from './SuperheroCard';
import ConfirmationModal from './ConfirmationModal';
import './CharacterCarousel.css';

export default function CharacterCarousel() {
  const [characters, setCharacters] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchCharacters = useCallback(() => {
    fetch(`/api/kits`, {
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        credentials: 'include',
      },
    })
      .then(res => res.json())
      .then(data => setCharacters(data))
      .catch(err => console.error('Failed to load characters:', err));
  }, [API_BASE]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleDelete = (id) => {
    fetch(`/api/kits/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        credentials: 'include',
      },
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
    navigate(`/edit/${character.id}`);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    fetchCharacters();
  };

  return (
    <div className="charactert-carousel-container">
      <section className="character-carousel-section">
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
