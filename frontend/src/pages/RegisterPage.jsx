import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/apiService';
import './AuthPages.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    registration_id: '',
    password: '',
    confirm_password: '',
    role: 'student',
    department: '',
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

    // Validation
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.registration_id || !formData.password || !formData.department) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      setError('');
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header text-center">
          <h1 className="mb-2">🅿️ Campus Parking</h1>
          <p className="text-muted">Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="registration_id" className="form-label">Registration ID</label>
              <input
                type="text"
                className="form-control"
                id="registration_id"
                name="registration_id"
                value={formData.registration_id}
                onChange={handleChange}
                placeholder="RIT12345"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@ritchennai.ac.in"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                className="form-select"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="department" className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Computer Science"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm password"
              />
            </div>
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-muted">Already have an account?</p>
          <Link to="/login" className="btn btn-outline-primary w-100">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
