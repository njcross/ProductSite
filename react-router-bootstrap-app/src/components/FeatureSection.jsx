import './FeatureSection.css';



import EditableField from '../components/EditableField';export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="container text-center">
        <h2 className="section-title">{<EditableField contentKey="content_22" />}</h2>
        <div className="features-steps">
          <div className="feature-step">
            <div className="step-icon">📋</div>
            <h4>{<EditableField contentKey="content_23" />}</h4>
            <p>{<EditableField contentKey="content_24" />}</p>
          </div>
          <div className="feature-step">
            <div className="step-icon">📝</div>
            <h4>{<EditableField contentKey="content_25" />}</h4>
            <p>{<EditableField contentKey="content_26" />}</p>
          </div>
          <div className="feature-step">
            <div className="step-icon">➕</div>
            <h4>{<EditableField contentKey="content_27" />}</h4>
            <p>{<EditableField contentKey="content_28" />}</p>
          </div>
          <div className="feature-step">
            <div className="step-icon">{<EditableField contentKey="content_29" />}</div>
            <h4>{<EditableField contentKey="content_30" />}</h4>
            <p>{<EditableField contentKey="content_31" />}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
