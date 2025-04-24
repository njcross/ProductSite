// src/components/FavoriteFiltersDropdown.jsx
import { useFavorites } from '../context/FavoritesContext';
import './FavoriteFiltersDropdown.css';

export default function FavoriteFiltersDropdown({ onApply }) {
  const { favoriteFilters } = useFavorites();

  return (
    <div className="favorite-filters-dropdown">
      <label>Favorite Filters:</label>
      <select onChange={(e) => onApply(JSON.parse(e.target.value))}>
        <option value="">Select a saved filter</option>
        {favoriteFilters.map((filter, index) => (
          <option key={index} value={JSON.stringify(filter)}>
            {filter.name || `Filter ${index + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
