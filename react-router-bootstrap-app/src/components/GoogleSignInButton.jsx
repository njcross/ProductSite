import { Button } from 'react-bootstrap';
import './GoogleSignInButton.css';

export default function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/login/google`;
  };

  return (
    <Button onClick={handleGoogleLogin} className="google-login-btn mt-3" variant="outline-danger">
      <i className="fab fa-google me-2"></i> Sign in with Google
    </Button>
  );
}