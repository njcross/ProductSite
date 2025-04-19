import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="display-4">404</h1>
        <p className="lead">Page not found</p>
        <a href="/" className="btn btn-primary mt-3">Go Home</a>
      </div>
    </div>
  );
}
