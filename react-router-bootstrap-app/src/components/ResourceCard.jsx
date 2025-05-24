import { useUser } from '../context/UserContext';
import './ResourceCard.css';

export default function ResourceCard({ resource, onDelete }) {
  const { currentUser } = useUser();

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${resource.title}"?`)) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resources/${resource.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok && onDelete) {
        onDelete(resource.id);
      } else {
        alert('Failed to delete resource');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting resource');
    }
  };

  return (
    <div className="resource-card">
      <img
        src={`${process.env.REACT_APP_API_URL}${resource.thumbnail_url}`}
        alt={resource.title || 'Resource image'}
      />
      <h5>{resource.title}</h5>
      <p>{resource.description}</p>
      <a
        href={`${process.env.REACT_APP_API_URL}${resource.file_url}`}
        download
        className="download-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download
      </a>
      {currentUser?.role === 'admin' && (
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
      )}
    </div>
  );
}
