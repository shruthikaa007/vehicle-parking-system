import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/apiService';

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 145,
    total_vehicles: 89,
    total_slots: 500,
    available_slots: 234,
    pending_verifications: 12,
    active_violations: 8
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rejectingVehicle, setRejectingVehicle] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await vehicleService.getVehicles();

      if (response.status === 'success') {
        setVehicles(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setMessage('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const verifyVehicle = async (
    vehicleId,
    status,
    reason = null
  ) => {
    try {
      const response = await vehicleService.verifyVehicle(
        vehicleId,
        status,
        reason
      );

      if (response.status === 'success') {
        setMessage(
          status === 'Verified'
            ? 'Vehicle verified successfully!'
            : 'Vehicle rejected successfully!'
        );

        setRejectingVehicle(null);
        setRejectionReason('');

        // Refresh vehicle list
        fetchVehicles();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage(
        error.message || 'Failed to verify vehicle'
      );
    }
  };

  const handleReject = (vehicleId) => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    verifyVehicle(
      vehicleId,
      'Rejected',
      rejectionReason
    );
  };

  // Show only pending vehicles
  const pendingVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.verification_status === 'Pending'
  );

  return (
    <div className="p-4">

      <h2 className="mb-4">
        📈 Admin Dashboard
      </h2>

      {/* Success / Error Message */}
      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}

      {/* ================= STATISTICS ================= */}

      <div className="row">

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-primary">
                {stats.total_users}
              </h5>

              <p className="text-muted">
                Total Users
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-success">
                {stats.total_vehicles}
              </h5>

              <p className="text-muted">
                Registered Vehicles
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-warning">
                {pendingVehicles.length}
              </h5>

              <p className="text-muted">
                Pending Verifications
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="row">

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-info">
                {stats.total_slots}
              </h5>

              <p className="text-muted">
                Total Slots
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-success">
                {stats.available_slots}
              </h5>

              <p className="text-muted">
                Available Slots
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-danger">
                {stats.active_violations}
              </h5>

              <p className="text-muted">
                Active Violations
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ================= PENDING VEHICLES ================= */}

      <div className="card mt-4">

        <div className="card-header">
          <h4 className="mb-0">
            🚗 Pending Vehicle Verifications
          </h4>
        </div>

        <div className="card-body">

          {loading ? (

            <p>Loading vehicles...</p>

          ) : pendingVehicles.length === 0 ? (

            <div className="alert alert-success">
              No pending vehicle verifications.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered table-hover">

                <thead>
                  <tr>
                    <th>Registration</th>
                    <th>Owner</th>
                    <th>Vehicle Type</th>
                    <th>Model</th>
                    <th>Color</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {pendingVehicles.map(
                    (vehicle) => (

                      <tr key={vehicle.id}>

                        <td>
                          <strong>
                            {vehicle.registration_number}
                          </strong>
                        </td>

                        <td>
                          {vehicle.owner_name}

                          <br />

                          <small className="text-muted">
                            {vehicle.owner_email}
                          </small>
                        </td>

                        <td>
                          {vehicle.vehicle_type}
                        </td>

                        <td>
                          {vehicle.model}
                        </td>

                        <td>
                          {vehicle.color}
                        </td>

                        <td>
                          <span className="badge bg-warning text-dark">
                            {vehicle.verification_status}
                          </span>
                        </td>

                        <td>

                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() =>
                              verifyVehicle(
                                vehicle.id,
                                'Verified'
                              )
                            }
                          >
                            ✅ Approve
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              setRejectingVehicle(
                                vehicle.id
                              )
                            }
                          >
                            ❌ Reject
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ================= REJECTION FORM ================= */}

      {rejectingVehicle && (

        <div className="card mt-4">

          <div className="card-header bg-danger text-white">
            Reject Vehicle
          </div>

          <div className="card-body">

            <label className="form-label">
              Rejection Reason
            </label>

            <textarea
              className="form-control mb-3"
              rows="3"
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(
                  e.target.value
                )
              }
              placeholder="Enter reason for rejecting this vehicle..."
            />

            <button
              className="btn btn-danger me-2"
              onClick={() =>
                handleReject(rejectingVehicle)
              }
            >
              Confirm Rejection
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setRejectingVehicle(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;