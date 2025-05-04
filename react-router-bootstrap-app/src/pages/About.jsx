import './About.css';
import ContactForm from '../components/ContactForm';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet';

export default function About() {
  return (
    <div className="about-page container py-5">
      <Helmet>
        <title>About Us – My Play Tray</title>
        <meta name="description" content="Learn about our mission to bring fun, hands-on Play kits experiences." />
      </Helmet>
      <h1 className="mb-4 text-center">{ <EditableField contentKey="content_92" /> }</h1>
      <p className="lead text-center text-light">{ <EditableField contentKey="content_93" /> }</p>

      <div className="author-section text-center">
        <h3 className="text-white">{ <EditableField contentKey="content_94" /> }</h3>
        <p className="text-light mb-1"><strong>{ <EditableField contentKey="content_95" /> }</strong></p>
        <p className="text-light">📧 <a href="mailto:njcross1990@gmail.com">{ <EditableField contentKey="content_96" /> }</a></p>
      </div>
      <ContactForm />
    </div>
  );
}
