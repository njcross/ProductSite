import { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import ResourceUploadForm from '../components/ResourceUploadForm';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import './ResourcesPage.css';

export default function ResourcesPage() {

  const [resources, setResources] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL;
  const { currentUser } = useUser();

  useEffect(() => {
    fetch(`${API_BASE}/api/resources`)
      .then(res => res.json())
      .then(setResources)
      .catch(console.error);
  }, [API_BASE]);

  return (
    <div className="resources-page">
      <Helmet>
              <title>Resources – My Play Tray</title>
              <meta name="description" content="Awesome downloadable resources to make the most out of your Play Trays." />
            </Helmet>
      <h1>Parent Resources</h1>
      {currentUser?.role === 'admin' && <ResourceUploadForm />}
      <div className="resource-grid">
        {resources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
