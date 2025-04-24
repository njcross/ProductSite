import './FilterBy.css';



import EditableField from '../components/EditableField';export default function FilterBy({ onFilterChange }) {
  return (
    <div className="filter-by">
      <label>{<EditableField contentKey="content_32" />}</label>
      <select onChange={e => onFilterChange(e.target.value)}>
      <option value="">
  <EditableField contentKey="content_33" plain />
</option>
<option value="">
        <EditableField contentKey="content_6" plain/>
        </option>
        <option value="">
        <EditableField contentKey="content_7" plain/></option>
      </select>
    </div>
  );
}
