// src/components/InventorySelectorModal.jsx
import './InventorySelectorModal.css';

export default function InventorySelectorModal({ available, onSelect, onCancel }) {
  return (
    <div>
      <h5>Select a location:</h5>
      {available.map((inv) => (
        <button key={inv.id} onClick={() => onSelect(inv.id)}>
          {inv.location_name} ({inv.quantity} available)
        </button>
      ))}
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
