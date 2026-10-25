import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import VehicleRegistration from './pages/VehicleRegistration';
import MyVehicles from './pages/MyVehicles';
import ParkingSlots from './pages/ParkingSlots';
import MakeReservation from './pages/MakeReservation';
import MyReservations from './pages/MyReservations';
import Notifications from './pages/Notifications';
import SecurityDashboard from './pages/SecurityDashboard';
import EntryExitManagement from './pages/EntryExitManagement';
import ViolationManagement from './pages/ViolationManagement';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);

        setUser(userData);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  // Login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);

    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);

    localStorage.removeItem('user');
  };

  // Loading screen
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>

          <Route
            path="/login"
            element={
              <LoginPage onLogin={handleLogin} />
            }
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </Router>
    );
  }

  // =====================================================
  // LOGGED IN
  // =====================================================

  return (
    <Router>

      <div className="d-flex">

        {/* Sidebar */}
        <Sidebar
          user={user}
          onLogout={handleLogout}
        />

        <div className="flex-fill">

          {/* Navbar */}
          <Navbar
            user={user}
            onLogout={handleLogout}
          />

          <div className="main-content">

            <Routes>

              {/* =================================================
                  COMMON ROUTES
                  ================================================= */}

              <Route
                path="/dashboard"
                element={
                  <Dashboard user={user} />
                }
              />

              <Route
                path="/notifications"
                element={<Notifications />}
              />

              <Route
                path="/profile"
                element={
                  <Profile user={user} />
                }
              />

              {/* =================================================
                  STUDENT / STAFF FEATURES
                  ================================================= */}

              <Route
                path="/vehicle-registration"
                element={<VehicleRegistration />}
              />

              <Route
                path="/my-vehicles"
                element={<MyVehicles />}
              />

              <Route
                path="/parking-slots"
                element={<ParkingSlots />}
              />

              <Route
                path="/make-reservation"
                element={<MakeReservation />}
              />

              <Route
                path="/my-reservations"
                element={<MyReservations />}
              />

              {/* =================================================
                  SECURITY + ADMIN FEATURES
                  ================================================= */}

              {(user.role === 'security' ||
                user.role === 'admin') && (
                <>

                  {/* Security Dashboard */}
                  <Route
                    path="/security-dashboard"
                    element={
                      <SecurityDashboard />
                    }
                  />

                  {/* Entry / Exit */}
                  <Route
                    path="/entry-exit-management"
                    element={
                      <EntryExitManagement />
                    }
                  />

                  {/* Violation Management
                      Security = Report
                      Admin = Review / Resolve
                  */}
                  <Route
                    path="/violation-management"
                    element={
                      <ViolationManagement
                        user={user}
                      />
                    }
                  />

                </>
              )}

              {/* =================================================
                  ADMIN ONLY
                  ================================================= */}

              {user.role === 'admin' && (
                <Route
                  path="/admin-dashboard"
                  element={
                    <AdminDashboard />
                  }
                />
              )}

              {/* =================================================
                  DEFAULT ROUTE
                  ================================================= */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Routes>

          </div>

        </div>

      </div>

    </Router>
  );
}

export default App;    