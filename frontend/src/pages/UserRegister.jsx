import '../styles/auth.css';
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserRegister() {
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = event.target.fullName.value;
    const email = event.target.email.value;
    const role = event.target.role.value;
    const password = event.target.password.value;

    if (!role) {
      alert('Please select a role');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/user/register',
        { fullName, email, password, role },
        { withCredentials: true }
      );

      alert(response.data.message);
 navigate(`/user/${response.data.user.role}/${response.data.user._id}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      alert(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">ProctorInterview</span>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Connected by heart, Bridge the distance
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Role Dropdown */}
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

            {/* Password */}
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

            {/* Terms */}
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

          {/* Footer */}
           <div className="form-divider">
            <span className="form-divider-text">or</span>
          </div>
          <div className="auth-footer">
            <span className="auth-footer-text">
              Already have an account?
              <a href="/user/login" className="auth-footer-link">
                Sign In
              </a>
            </span>
          </div>

         

         
        </div>
      </div>
    </div>
  );
}
