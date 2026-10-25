import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">

      {/* Logo */}
      <div className="logo">
        <h4>🅿️ Parking</h4>
        <small>Management System</small>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`nav-link ${
            isActive('/dashboard') ? 'active' : ''
          }`}
        >
          <span className="icon">📊</span>
          <span>Dashboard</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className={`nav-link ${
            isActive('/notifications') ? 'active' : ''
          }`}
        >
          <span className="icon">🔔</span>
          <span>Notifications</span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`nav-link ${
            isActive('/profile') ? 'active' : ''
          }`}
        >
          <span className="icon">👤</span>
          <span>Profile</span>
        </Link>

      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          className="btn btn-outline-light btn-sm w-100"
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </div>

    </div>
  );
}

export default Sidebar;