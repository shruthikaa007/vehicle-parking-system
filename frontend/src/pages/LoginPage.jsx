import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/apiService';
import './AuthPages.css';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      onLogin(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header text-center">
          <h1 className="mb-2">🅿️ Campus Parking</h1>
          <p className="text-muted">Vehicle Parking & Access Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted">Don't have an account?</p>
          <Link to="/register" className="btn btn-outline-primary w-100">
            Register Here
          </Link>
        </div>

        <div className="demo-credentials mt-4 p-3 bg-light rounded">
          <h6 className="mb-2">Demo Credentials:</h6>
          <small className="text-muted">
            <p className="mb-1"><strong>Student:</strong> rahul.student@ritchennai.ac.in</p>
            <p className="mb-1"><strong>Staff:</strong> ajay.staff@ritchennai.ac.in</p>
            <p className="mb-1"><strong>Security:</strong> ravi.security@ritchennai.ac.in</p>
            <p className="mb-1"><strong>Admin:</strong> admin@ritchennai.ac.in</p>
            <p><strong>Password:</strong> password123 (for all)</p>
          </small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
