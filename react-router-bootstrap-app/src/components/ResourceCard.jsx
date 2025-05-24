import './ResourceCard.css';

export default function ResourceCard({ resource }) {
  return (
    <div className="resource-card">
      <img src={resource.thumbnail_url} alt={resource.title} />
      <h5>{resource.title}</h5>
      <p>{resource.description}</p>
      <a href={resource.file_url} download className="download-btn" target="_blank" rel="noopener noreferrer">
        Download
      </a>
    </div>
  );
}
