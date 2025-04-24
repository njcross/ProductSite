import './NotFound.css';



import EditableImage from '../components/EditableImage';import EditableField from '../components/EditableField';export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="display-4">{<EditableField contentKey="content_134" />}</h1>
        <p className="lead">{<EditableField contentKey="content_135" />}</p>
        <a href="/" className="btn btn-primary mt-3">{<EditableField contentKey="content_136" />}</a>
      </div>
    </div>
  );
}
