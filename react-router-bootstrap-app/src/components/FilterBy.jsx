import './FilterBy.css';

export default function FilterBy({ onFilterChange }) {
  return (
    <div className="filter-by">
      <label>Filter By Alignment:</label>
      <select onChange={e => onFilterChange(e.target.value)}>
        <option value="">All</option>
        <option value="hero">Hero</option>
        <option value="villain">Villain</option>
      </select>
    </div>
  );
}
