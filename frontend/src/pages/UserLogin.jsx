import '../styles/auth.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
  
export default function UserLogin() {
const navigate = useNavigate();

  
  const handleSubmit = async (event) => {
  event.preventDefault();

  const email = event.target.email.value;
  const password = event.target.password.value;

  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/user/login',
      { email, password },
      { withCredentials: true }
    );

    alert(response.data.message);
    navigate('/home');

  } catch (err) {
    const msg = err.response?.data?.message || "Something went wrong";
    alert(msg); 
  }
};

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">ProctorInterview</span>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
              />
              <span className="form-error">Please enter a valid email</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
              />
              <span className="form-error">Password is incorrect</span>
            </div>

            <div className="checkbox-group">
              <input
                id="rememberMe"
                type="checkbox"
                className="checkbox-input"
              />
              <label htmlFor="rememberMe" className="checkbox-label">
                Remember me for 30 days
              </label>
            </div>

            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>

          <div className="form-divider">
            <span className="form-divider-text">or</span>
          </div>

          <div className="auth-footer">
            <span className="auth-footer-text">
              Don't have an account?
              <a href="/user/register" className="auth-footer-link">
                Create one now
              </a>
            </span>
          </div>

          <div className="auth-footer" style={{ marginTop: '16px', paddingTop: '0', borderTop: 'none' }}>
            <a href="/forgot-password" className="auth-footer-link" style={{ marginLeft: '0' }}>
              Forgot your password?
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
