import '../styles/forms.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

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

      setUser(response.data.user);

      navigate('/dashboard'); 

    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      alert(msg);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <span className="form-logo">ProctorInterview</span>
            <h1 className="form-title">Welcome Back</h1>
            <p className="form-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>

          <div className="form-divider">
            <span className="form-divider-text">or</span>
          </div>

          <div className="form-footer">
            <span className="form-footer-text">
              Don't have an account?
              <a href="/user/register" className="form-footer-link">
                Create one now
              </a>
            </span>
          </div>

          <div
            className="form-footer"
            style={{ marginTop: '16px', paddingTop: '0', borderTop: 'none' }}
          >
            <a href="/forgot-password" className="form-footer-link">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
