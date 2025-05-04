import { Button } from 'react-bootstrap';
import './GoogleSignInButton.css';

export default function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/login/google`;
  };

  return (
    <div className="google-login-wrapper">
      <Button
        onClick={handleGoogleLogin}
        className="google-login-btn"
        variant="outline-light"
      >
        <i className="fab fa-google me-2"></i>
        Continue with Google
      </Button>
    </div>
  );
}
