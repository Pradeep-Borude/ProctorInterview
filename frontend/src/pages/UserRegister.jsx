import '../styles/forms.css';
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserRegister() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = event.target.fullName.value;
    const email = event.target.email.value;
    const role = event.target.role.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (!role) {
      alert('Please select a role');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/user/register',
        { fullName, email, password, confirmPassword, role },
        { withCredentials: true }
      );

      setUser(response.data.user);

      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      alert(msg);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <span className="form-logo">ProctorInterview</span>
            <h1 className="form-title">Create Account</h1>
            <p className="form-subtitle">
              connecting hearts , bridging the distance
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

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
              <label className="form-label" htmlFor="role">
                Select Role
              </label>
              <select
                id="role"
                name="role"
                className="form-input"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Choose your role
                </option>
                <option value="candidate">Candidate</option>
                <option value="interviewer">Interviewer</option>
              </select>
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
                placeholder="Create a strong password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Create a strong password"
                required
                minLength={6}
              />
            </div>

            <div className="checkbox-group">
              <input
                id="terms"
                type="checkbox"
                className="checkbox-input"
                required
              />
              <label htmlFor="terms" className="checkbox-label">
                I agree to the Terms & Conditions
              </label>
            </div>

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>

          <div className="form-divider">
            <span className="form-divider-text">or</span>
          </div>

          <div className="form-footer">
            <span className="form-footer-text">
              Already have an account?
              <a href="/user/login" className="form-footer-link">
                Sign In
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
