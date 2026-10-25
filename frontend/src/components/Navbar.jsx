import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Campus Parking System 🅿️
      </div>

      <div className="navbar-end">
        <div className="navbar-user">
          <span className="user-info">
            {user?.name} 
            <small className="ms-2">({user?.role})</small>
          </span>
          
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="dropdown">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⚙️
            </button>
            
            {showMenu && (
              <div className="dropdown-menu show">
                <a href="/profile" className="dropdown-item">
                  Profile
                </a>
                <hr className="dropdown-divider" />
                <button 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
