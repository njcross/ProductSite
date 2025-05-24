import { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import ResourceUploadForm from '../components/ResourceUploadForm';
import './ResourcesPage.css';

export default function ResourcesPage({ isAdmin }) {
  const [resources, setResources] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/api/resources`)
      .then(res => res.json())
      .then(setResources)
      .catch(console.error);
  }, [API_BASE]);

  return (
    <div className="resources-page">
      <h1>Parent Resources</h1>
      {isAdmin && <ResourceUploadForm />}
      <div className="resource-grid">
        {resources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
