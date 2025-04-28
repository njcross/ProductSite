import React, { useState, useEffect } from 'react';
import CharacterList from '../components/CharacterList';
import FilterBy from '../components/FilterBy';
import ViewingOptions from '../components/ViewingOptions';
import { Container, Row, Col } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import './Cards.css';

export default function Cards() {
  const { currentUser } = useUser();

  const [savedFilters, setSavedFilters] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;
  const [filters, setFilters] = useState({
    alignment: '',
    view: 'grid',
    itemsPerPage: 12,
    sortBy: 'name',
    search: ''
  });


useEffect(() => {
  if (currentUser) {
    fetch(`/api/favorites/`, {
      credentials: 'include',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then(res => res.json())
      .then(data => setSavedFilters(data || []))
      .catch(err => console.error('Failed to fetch saved filters:', err));
  }
}, [currentUser, API_BASE]);

  const handleFilterChange = (updated) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const handleSaveSearch = () => {
    const name = prompt('Give a name to this search:');
    if (!name) return;

    fetch(`/api/favorites`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        type: 'filter',
        name,
        value: name,
        filter_data: filters
      })
    })
      .then(res => res.json())
      .then(() => {
        setSavedFilters(prev => [...prev, { name, filter_data: filters }]);
        alert('Search saved!');
      })
      .catch(err => console.error('Failed to save search:', err));
  };

  const handleSelectSavedFilter = (selectedName) => {
    const selected = savedFilters.find(fav => fav.name === selectedName);
    if (selected) setFilters(selected.filter_data);
  };

  const handleClearSearch = () => {
    setFilters({
      alignment: '',
      view: 'grid',
      itemsPerPage: 12,
      sortBy: 'name',
      search: ''
    });
  };

  const handleDeleteSavedFilter = (id) => {
    fetch(`/api/favorites/character/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    })
      .then(() => {
        setSavedFilters(prev => prev.filter(f => f.id !== id));
      })
      .catch(err => console.error('Failed to delete filter:', err));
  };

  return (
    <div className="cards-page">
      <Container fluid>
        <h2 className="text-center text-white mb-4">Character Collection</h2>
        <Row>
        <Col md={2} sm={12}>
            <FilterBy
              selectedAlignment={filters.alignment}
              onFilterChange={(val) => handleFilterChange({ alignment: val })}
              savedFilters={savedFilters}
              onSelectSavedFilter={handleSelectSavedFilter}
              onDeleteSavedFilter={handleDeleteSavedFilter}
              currentUser={currentUser}
            />
          </Col>
          <Col md={10} sm={12}>
            <ViewingOptions
              viewMode={filters.view}
              onViewModeChange={(val) => handleFilterChange({ view: val })}
              itemsPerPage={filters.itemsPerPage}
              onItemsPerPageChange={(val) => handleFilterChange({ itemsPerPage: val })}
              sortBy={filters.sortBy}
              onSortChange={(val) => handleFilterChange({ sortBy: val })}
              search={filters.search}
              onSearchChange={(val) => handleFilterChange({ search: val })}
              onClearSearch={handleClearSearch}
              onSaveSearch={currentUser ? handleSaveSearch : null}
            />
            <CharacterList
              view={filters.view}
              itemsPerPage={filters.itemsPerPage}
              sortBy={filters.sortBy}
              search={filters.search}
              alignment={filters.alignment}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
