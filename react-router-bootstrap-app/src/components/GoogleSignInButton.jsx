import './GoogleSignInButton.css';

export default function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/login/google`;
  };

  return (
    <button className="google-login-btn" onClick={handleGoogleLogin}>
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        className="google-logo"
      />
      <span className="google-btn-text">Sign in with Google</span>
    </button>
  );
}