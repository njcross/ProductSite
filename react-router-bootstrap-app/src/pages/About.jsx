import './About.css';

export default function About() {
  return (
    <div className="about-page container py-5">
      <h1 className="mb-4 text-center">ℹ️ About This App</h1>
      <p className="lead text-center text-light">
        This application is a fan-made database for Marvel characters. It allows users to browse, edit, and manage an ever-growing collection of heroes and villains.
      </p>

      <div className="author-section text-center">
        <h3 className="text-white">👨‍💻 Author</h3>
        <p className="text-light mb-1"><strong>Nicholas Cross</strong></p>
        <p className="text-light">📧 <a href="mailto:njcross1990@gmail.com">njcross1990@gmail.com</a></p>
      </div>
    </div>
  );
}
