import './NotFound.css';
import { Helmet, HelmetProvider } from 'react-helmet-async';


import EditableImage from '../components/EditableImage';import EditableField from '../components/EditableField';export default function NotFound() {
  return (
    <div className="not-found-page">
      <Helmet>
        <title>Page Not Found – My Play Trays</title>
        <meta name="description" content="Oops! This page doesn’t exist. Return home to continue your journey." />
      </Helmet>
      <div className="not-found-container">
        <h1 className="display-4">{<EditableField contentKey="content_134" />}</h1>
        <p className="lead">{<EditableField contentKey="content_135" />}</p>
        <a href="/" className="btn btn-primary mt-3">{<EditableField contentKey="content_136" />}</a>
      </div>
    </div>
  );
}
