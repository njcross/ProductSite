import React, { useState, useEffect } from 'react';
import CharacterList from '../components/CharacterList';
import FilterBy from '../components/FilterBy';
import ViewingOptions from '../components/ViewingOptions';
import { Container, Row, Col } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import './Cards.css';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';



export default function Cards() {
  const { currentUser } = useUser();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  const [savedFilters, setSavedFilters] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;
  const [filters, setFilters] = useState({
    view: 'grid',
    itemsPerPage: 12,
    sortBy: 'name',
    search: searchQuery,
    age_ids: [],
    category_ids: [],
    rating: ''
  });


useEffect(() => {
  if (currentUser) {
    fetch(`${API_BASE}/api/favorites/`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setSavedFilters(data || []))
      .catch(err => console.error('Failed to fetch saved filters:', err));
  }
}, [currentUser, API_BASE]);

useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  setFilters(prev => ({ ...prev, search: searchQuery }));
}, [location.search]);

  const handleFilterChange = (updated) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const handleSaveSearch = () => {
    const name = prompt('Give a name to this search:');
    if (!name) return;

    fetch(`${API_BASE}/api/favorites`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
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
      age_ids: [],
      category_ids: [],
      view: 'grid',
      itemsPerPage: 12,
      sortBy: 'name',
      search: '',
      rating: ''
    });
  };

  const handleDeleteSavedFilter = (id) => {
    fetch(`${API_BASE}/api/favorites/character/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(() => {
        setSavedFilters(prev => prev.filter(f => f.id !== id));
      })
      .catch(err => console.error('Failed to delete filter:', err));
  };

  return (
    <div className="cards-page">
      <Helmet>
        <title>Play Trays Catalog</title>
        <meta name="description" content="Browse all available Play kits by category, age, and rating." />
      </Helmet>
      <Container fluid>
        <h2 className="text-center text-white mb-4">Character Collection</h2>
        <Row>
        <Col md={2} sm={12}>
          <FilterBy
            selectedAlignment={filters.alignment}
            selectedAges={filters.age_ids}
            selectedCategories={filters.category_ids}
            selectedRating={filters.rating}
            onFilterChange={handleFilterChange}
            savedFilters={savedFilters}
            onSelectSavedFilter={handleSelectSavedFilter}
            onDeleteSavedFilter={handleDeleteSavedFilter}
            currentUser={currentUser}
            onSaveFilter={currentUser ? handleSaveSearch : null}
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
            />
            <CharacterList
              view={filters.view}
              itemsPerPage={filters.itemsPerPage}
              sortBy={filters.sortBy}
              search={filters.search}
              alignment={filters.alignment}
              selectedAges={filters.age_ids}
              selectedCategories={filters.category_ids}
              rating={filters.rating}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
