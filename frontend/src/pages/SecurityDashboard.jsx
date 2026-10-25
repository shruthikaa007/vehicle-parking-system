import React, { useState } from 'react';
import { securityService, violationService } from '../services/apiService';

function SecurityDashboard() {
  const [searchReg, setSearchReg] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Violation form state
  const [violation, setViolation] = useState({
    registration_number: '',
    violation_type: '',
    severity: '',
    description: '',
    location: ''
  });

  const [reporting, setReporting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchReg.trim()) {
      setError('Please enter registration number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setVehicleData({
        registration_number: searchReg.toUpperCase()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle violation form changes
  const handleViolationChange = (e) => {
    setViolation({
      ...violation,
      [e.target.name]: e.target.value
    });
  };

  // Report violation
  const handleReportViolation = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (
      !violation.registration_number.trim() ||
      !violation.violation_type ||
      !violation.severity ||
      !violation.description.trim() ||
      !violation.location.trim()
    ) {
      setError('Please fill in all violation details');
      return;
    }

    try {
      setReporting(true);

      const response = await violationService.createViolation({
        registration_number:
          violation.registration_number.toUpperCase(),
        violation_type: violation.violation_type,
        severity: violation.severity,
        description: violation.description,
        location: violation.location
      });

      if (response.status === 'success') {
        setSuccess('Violation reported successfully!');

        setViolation({
          registration_number: '',
          violation_type: '',
          severity: '',
          description: '',
          location: ''
        });
      } else {
        setError(
          response.message || 'Failed to report violation'
        );
      }

    } catch (err) {
      console.error(err);
      setError('Failed to report violation');
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="p-4">

      {/* PAGE TITLE */}
      <h2 className="mb-4">🛡️ Security Dashboard</h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* ================= VEHICLE SEARCH ================= */}
      <div className="card mb-4">

        <div className="card-header">
          <h5 className="mb-0">🚗 Vehicle Search</h5>
        </div>

        <div className="card-body">

          <form onSubmit={handleSearch}>

            <div className="input-group">

              <input
                type="text"
                className="form-control"
                placeholder="Enter registration number (e.g., TN07AB1234)"
                value={searchReg}
                onChange={(e) => setSearchReg(e.target.value)}
              />

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>

            </div>

          </form>

        </div>
      </div>

      {/* ================= VEHICLE DETAILS ================= */}
      {vehicleData && (
        <div className="card mb-4">

          <div className="card-header">
            <h5>Vehicle Details</h5>
          </div>

          <div className="card-body">

            <p>
              <strong>Registration:</strong>{' '}
              {vehicleData.registration_number}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              <span className="badge bg-success">
                Found
              </span>
            </p>

          </div>

        </div>
      )}

      {/* ================= REPORT VIOLATION ================= */}
      <div className="card">

        <div className="card-header">
          <h5 className="mb-0">🚨 Report Violation</h5>
        </div>

        <div className="card-body">

          <form onSubmit={handleReportViolation}>

            {/* Registration Number */}
            <div className="mb-3">

              <label className="form-label">
                Vehicle Registration Number
              </label>

              <input
                type="text"
                className="form-control"
                name="registration_number"
                placeholder="e.g., TN07AB5678"
                value={violation.registration_number}
                onChange={handleViolationChange}
              />

            </div>

            {/* Violation Type */}
            <div className="mb-3">

              <label className="form-label">
                Violation Type
              </label>

              <select
                className="form-select"
                name="violation_type"
                value={violation.violation_type}
                onChange={handleViolationChange}
              >

                <option value="">
                  Select violation type
                </option>

                <option value="Unauthorized Parking">
                  Unauthorized Parking
                </option>

                <option value="Overstay">
                  Overstay
                </option>

                <option value="Wrong Parking Slot">
                  Wrong Parking Slot
                </option>

                <option value="Unregistered Vehicle">
                  Unregistered Vehicle
                </option>

                <option value="Expired Reservation">
                  Expired Reservation
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* Severity */}
            <div className="mb-3">

              <label className="form-label">
                Severity
              </label>

              <select
                className="form-select"
                name="severity"
                value={violation.severity}
                onChange={handleViolationChange}
              >

                <option value="">
                  Select severity
                </option>

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

              </select>

            </div>

            {/* Description */}
            <div className="mb-3">

              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-control"
                name="description"
                rows="3"
                placeholder="Describe the violation"
                value={violation.description}
                onChange={handleViolationChange}
              />

            </div>

            {/* Location */}
            <div className="mb-3">

              <label className="form-label">
                Location
              </label>

              <input
                type="text"
                className="form-control"
                name="location"
                placeholder="e.g., Main Campus Parking"
                value={violation.location}
                onChange={handleViolationChange}
              />

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-danger"
              disabled={reporting}
            >
              {reporting
                ? 'Reporting...'
                : '🚨 Report Violation'}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}

export default SecurityDashboard;