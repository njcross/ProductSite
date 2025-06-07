import './GoogleSignInButton.css';

export default function GoogleSignInButton({ className = '' }) {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/login/google`;
  };

  return (
    <button
      type="button"
      className={`google-login-btn ${className}`}
      onClick={handleGoogleLogin}
    >
      <div className="google-logo-box">
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        className="google-logo"
      />
      </div>
      <span className="google-btn-text">Sign in with Google</span>
    </button>
  );
}
