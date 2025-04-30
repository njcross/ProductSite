// src/components/FavoriteFiltersDropdown.jsx
import { useFavorites } from '../context/FavoritesContext';
import './FavoriteFiltersDropdown.css';

export default function FavoriteFiltersDropdown({ onApply }) {
  const { favoriteFilters, removeFavoriteFilter } = useFavorites();

  return (
    <div className="favorite-filters-dropdown">
      <label>Favorite Filters:</label>
      <ul>
        {favoriteFilters.length === 0 ? (
          <li className="no-favorites">No saved filters</li>
        ) : (
          favoriteFilters.map((filter, index) => (
            <li key={index} className="filter-item">
              <button onClick={() => onApply(filter)} className="filter-name">
                {filter.name || `Filter ${index + 1}`}
              </button>
              <button
                onClick={() => removeFavoriteFilter(index)}
                className="delete-button"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
