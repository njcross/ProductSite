import { useEffect } from 'react';
import CharacterList from '../components/CharacterList';
import './Cards.css';

export default function Cards() {


  return (
    <div className="cards-page">
      <div className="container py-4">
        <h2 className="text-center text-white mb-4">Marvel Character Cards</h2>
        <CharacterList />
      </div>
    </div>
  );
}
