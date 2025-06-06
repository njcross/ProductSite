import React, { useState, useEffect } from 'react';
import CharacterList from '../components/CharacterList';
import FilterBy from '../components/FilterBy';
import ViewingOptions from '../components/ViewingOptions';
import { Container, Row, Col } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import './Cards.css';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import EditableField from '../components/EditableField';
import { useMemo } from 'react';

export default function Cards() {
  const { currentUser } = useUser();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  const [savedFilters, setSavedFilters] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;

  const defaultFilters = {
    view: 'grid',
    itemsPerPage: 12,
    page: 1,
    sortBy: 'name',
    sortDir: 'asc',
    search: searchQuery,
    age_ids: [],
    category_ids: [],
    rating: '',
    locations: []
  };

  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('viewingOptions_characters');
    return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
  });

  const memoizedAges = useMemo(() => filters.age_ids, [filters.age_ids]);
  const memoizedCategories = useMemo(() => filters.category_ids, [filters.category_ids]);
  const memoizedLocations = useMemo(() => filters.locations, [filters.locations]);
  const memorizedGrades = useMemo(() => filters.grade_ids, [filters.grade_ids]);
  const memorizedThemes = useMemo(() => filters.theme_ids, [filters.theme_ids]);

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

  useEffect(() => {
    localStorage.setItem('viewingOptions_characters', JSON.stringify(filters));
  }, [filters]);

  const handleFilterChange = (updated) => {
    const shouldResetPage = [
      'sortBy', 'sortDir', 'search',
      'age_ids', 'category_ids', 'rating', 'locations'
    ].some(key => key in updated);
  
    setFilters(prev => {
      const next = { ...prev, ...updated };
  
      // 👇 Reset sort direction to 'asc' if sortBy has changed
      if ('sortBy' in updated && updated.sortBy !== prev.sortBy) {
        next.sortDir = 'asc';
      }
  
      // 👇 Reset to page 1 if certain filters changed
      if (shouldResetPage) {
        next.page = 1;
      }
  
      return next;
    });
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

  const handleDeleteSavedFilter = (id) => {
    fetch(`${API_BASE}/api/favorites/character/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => setSavedFilters(prev => prev.filter(f => f.id !== id)))
      .catch(err => console.error('Failed to delete filter:', err));
  };

  const handleClearSearch = () => {
    setFilters(defaultFilters);
  };

  const handleSortDirChange = () => {
    setFilters(prev => ({
      ...prev,
      sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="cards-page">
      <Helmet>
        <title>My Play Tray's Catalog</title>
        <meta name="description" content="Browse all available Play trays by category, age, and rating." />
      </Helmet>
      <Container fluid>
        <h2 className="text-center text-white mb-4"><EditableField contentKey="content_254" /></h2>
        <Row>
          <Col md={2} sm={12}>
            <FilterBy
              selectedAlignment={filters.alignment}
              selectedAges={filters.age_ids}
              selectedCategories={filters.category_ids}
              initialSelectedRatings={filters.rating}
              selectedLocations={filters.locations}
              onFilterChange={handleFilterChange}
              savedFilters={savedFilters}
              onSelectSavedFilter={handleSelectSavedFilter}
              onDeleteSavedFilter={handleDeleteSavedFilter}
              currentUser={currentUser}
              onSaveFilter={currentUser ? handleSaveSearch : null}
              collection="kits"
            />
          </Col>
          <Col md={10} sm={12}>
            <ViewingOptions
              viewMode={filters.view}
              onViewModeChange={(val) => handleFilterChange({ view: val })}
              itemsPerPage={filters.itemsPerPage}
              onItemsPerPageChange={(val) => handleFilterChange({ itemsPerPage: val })}
              sortBy={filters.sortBy}
              sortDir={filters.sortDir}
              onSortDirChange={handleSortDirChange}
              onSortChange={(val) => handleFilterChange({ sortBy: val })}
              search={filters.search}
              onSearchChange={(val) => handleFilterChange({ search: val })}
              onClearSearch={handleClearSearch}
              collection="kits"
            />
            <CharacterList
              view={filters.view}
              itemsPerPage={filters.itemsPerPage}
              sortBy={filters.sortBy}
              sortDir={filters.sortDir}
              search={filters.search}
              alignment={filters.alignment}
              selectedAges={memoizedAges}
              selectedCategories={memoizedCategories}
              selectedLocations={memoizedLocations}
              selectedGrades={memorizedGrades}
              selectedThemes={memorizedThemes}
              rating={filters.rating}
              locations={filters.locations}
              page={filters.page}
              priceRange={filters.price_range}  
              onPageChange={(val) => handleFilterChange({ page: val })}
            />

          </Col>
        </Row>
      </Container>
    </div>
  );
}
