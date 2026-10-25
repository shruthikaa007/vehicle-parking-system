import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  vehicleService,
  reservationService,
  notificationService
} from '../services/apiService';

function Dashboard({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'student' || user?.role === 'staff') {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        vehicleResponse,
        reservationResponse,
        notificationResponse
      ] = await Promise.all([
        vehicleService.getVehicles(),
        reservationService.getReservations(),
        notificationService.getNotifications()
      ]);

      if (vehicleResponse.status === 'success') {
        setVehicles(vehicleResponse.data || []);
      }

      if (reservationResponse.status === 'success') {
        setReservations(reservationResponse.data || []);
      }

      if (notificationResponse.status === 'success') {
        setNotifications(notificationResponse.data || []);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Unable to load some dashboard information.');
    } finally {
      setLoading(false);
    }
  };

  const activeReservations = reservations.filter(
    (reservation) =>
      reservation.status === 'Active' ||
      reservation.status === 'Confirmed'
  );

  const pendingVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.verification_status === 'Pending' ||
      vehicle.verification_status === 'pending'
  );

  const unreadNotifications = notifications.filter(
    (notification) =>
      notification.is_read === 0 ||
      notification.is_read === false ||
      notification.is_read === '0'
  );

  return (
    <div className="container-fluid py-4">

      {/* =========================
          Welcome Section
      ========================== */}
      <div className="mb-4">
        <h2 className="fw-bold">
          Welcome, {user?.name || 'User'} 👋
        </h2>

        <p className="text-muted mb-2">
          Here's an overview of your campus parking activities.
        </p>

        <span className="badge bg-primary">
          {user?.role?.toUpperCase()}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {/* =========================
          Student / Staff Statistics
      ========================== */}
      {(user?.role === 'student' || user?.role === 'staff') && (
        <div className="row g-4 mb-5">

          {/* Registered Vehicles */}
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <p className="text-muted mb-1">
                      Registered Vehicles
                    </p>

                    <h3 className="fw-bold mb-0">
                      {vehicles.length}
                    </h3>
                  </div>

                  <div className="dashboard-icon">
                    🚗
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Active Reservations */}
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <p className="text-muted mb-1">
                      Active Reservations
                    </p>

                    <h3 className="fw-bold mb-0">
                      {activeReservations.length}
                    </h3>
                  </div>

                  <div className="dashboard-icon">
                    📅
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <p className="text-muted mb-1">
                      Pending Verifications
                    </p>

                    <h3 className="fw-bold mb-0">
                      {pendingVehicles.length}
                    </h3>
                  </div>

                  <div className="dashboard-icon">
                    ⏳
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Notifications Count */}
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <p className="text-muted mb-1">
                      New Notifications
                    </p>

                    <h3 className="fw-bold mb-0">
                      {unreadNotifications.length}
                    </h3>
                  </div>

                  <div className="dashboard-icon">
                    🔔
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* =========================
          Quick Actions
      ========================== */}
      <div className="mb-5">

        <div className="text-center mb-4">

          <h4 className="fw-bold mb-1">
            Quick Actions
          </h4>

          <p className="text-muted">
            Quickly access the features you need
          </p>

        </div>

        <div className="row g-4 quick-actions-row">

          {/* =========================
              Student / Staff Actions
          ========================== */}
          {(user?.role === 'student' || user?.role === 'staff') && (
            <>

              {/* Register Vehicle */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/vehicle-registration"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        🚗
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        Register Vehicle
                      </h6>

                      <p className="text-muted small mb-0">
                        Add your vehicle details
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

              {/* Parking Slots */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/parking-slots"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        🅿️
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        Parking Slots
                      </h6>

                      <p className="text-muted small mb-0">
                        Check slot availability
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

              {/* Make Reservation */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/make-reservation"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        📅
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        Make Reservation
                      </h6>

                      <p className="text-muted small mb-0">
                        Reserve a parking slot
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

              {/* My Reservations */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/my-reservations"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        📋
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        My Reservations
                      </h6>

                      <p className="text-muted small mb-0">
                        View your bookings
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

            </>
          )}

          {/* =========================
              Security / Admin Actions
          ========================== */}
          {(user?.role === 'security' || user?.role === 'admin') && (
            <>

              {/* Vehicle Search */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/security-dashboard"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        🔎
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        Vehicle Search
                      </h6>

                      <p className="text-muted small mb-0">
                        Search registered vehicles
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

              {/* Entry / Exit */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/entry-exit-management"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        📍
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        Entry / Exit
                      </h6>

                      <p className="text-muted small mb-0">
                        Manage vehicle movement
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

              {/* Violations */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <Link
                  to="/violation-management"
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm quick-action-card h-100">

                    <div className="card-body text-center p-4">

                      <div className="quick-action-icon">
                        ⚠️
                      </div>

                      <h6 className="fw-bold mt-3 mb-2">
                        Violations
                      </h6>

                      <p className="text-muted small mb-0">
                        Report and manage violations
                      </p>

                    </div>

                  </div>
                </Link>
              </div>

            </>
          )}

          {/* =========================
              Admin Action
          ========================== */}
          {user?.role === 'admin' && (
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">

              <Link
                to="/admin-dashboard"
                className="text-decoration-none"
              >
                <div className="card border-0 shadow-sm quick-action-card h-100">

                  <div className="card-body text-center p-4">

                    <div className="quick-action-icon">
                      📊
                    </div>

                    <h6 className="fw-bold mt-3 mb-2">
                      Admin Dashboard
                    </h6>

                    <p className="text-muted small mb-0">
                      Monitor campus parking
                    </p>

                  </div>

                </div>
              </Link>

            </div>
          )}

        </div>
      </div>

      {/* =========================
          Recent Vehicles
      ========================== */}
      {(user?.role === 'student' || user?.role === 'staff') &&
        vehicles.length > 0 && (

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Recent Vehicles
              </h5>

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>
                    <tr>
                      <th>Registration Number</th>
                      <th>Vehicle</th>
                      <th>Color</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {vehicles.slice(0, 5).map((vehicle) => (

                      <tr key={vehicle.id}>

                        <td className="fw-semibold">
                          {vehicle.registration_number}
                        </td>

                        <td>
                          {vehicle.make} {vehicle.model}
                        </td>

                        <td>
                          {vehicle.color}
                        </td>

                        <td>

                          <span
                            className={`badge ${
                              vehicle.verification_status === 'Verified'
                                ? 'bg-success'
                                : vehicle.verification_status === 'Rejected'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {vehicle.verification_status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      {/* =========================
          Recent Reservations
      ========================== */}
      {(user?.role === 'student' || user?.role === 'staff') &&
        reservations.length > 0 && (

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Recent Reservations
              </h5>

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Slot</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {reservations.slice(0, 5).map((reservation) => (

                      <tr key={reservation.id}>

                        <td className="fw-semibold">
                          {reservation.registration_number}
                        </td>

                        <td>
                          {reservation.slot_number ||
                            reservation.parking_slot ||
                            '-'}
                        </td>

                        <td>
                          {reservation.start_time ||
                            reservation.start_datetime ||
                            '-'}
                        </td>

                        <td>
                          {reservation.end_time ||
                            reservation.end_datetime ||
                            '-'}
                        </td>

                        <td>

                          <span className="badge bg-primary">
                            {reservation.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Dashboard;