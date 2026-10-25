import React, { useEffect, useState } from 'react';
import { violationService } from '../services/apiService';

function ViolationManagement({ user }) {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Report violation form
  const [formData, setFormData] = useState({
    registration_number: '',
    violation_type: '',
    severity: '',
    description: '',
    location: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const isSecurity = user?.role === 'security';
  const isAdmin = user?.role === 'admin';

  // =====================================================
  // LOAD VIOLATIONS
  // =====================================================

  const loadViolations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await violationService.getViolations();

      if (response.status === 'success') {
        setViolations(response.data || []);
      } else {
        setError(
          response.message || 'Failed to load violations'
        );
      }

    } catch (err) {
      console.error(err);
      setError('Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =====================================================
  // REPORT VIOLATION - SECURITY
  // =====================================================

  const handleReportViolation = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (
      !formData.registration_number.trim() ||
      !formData.violation_type ||
      !formData.severity ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      setError('Please fill in all violation details.');
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await violationService.createViolation({
          registration_number:
            formData.registration_number
              .trim()
              .toUpperCase(),

          violation_type:
            formData.violation_type,

          severity:
            formData.severity,

          description:
            formData.description.trim(),

          location:
            formData.location.trim()
        });

      if (response.status === 'success') {

        setMessage(
          'Violation reported successfully.'
        );

        setFormData({
          registration_number: '',
          violation_type: '',
          severity: '',
          description: '',
          location: ''
        });

        // Refresh violation list
        await loadViolations();

      } else {

        setError(
          response.message ||
          'Failed to report violation'
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        'Failed to report violation'
      );

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // ADMIN - UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    violationId,
    status
  ) => {

    try {

      setMessage('');
      setError('');

      const response =
        await violationService.updateViolation(
          violationId,
          { status }
        );

      if (response.status === 'success') {

        setMessage(
          `Violation marked as ${status}.`
        );

        await loadViolations();

      } else {

        setError(
          response.message ||
          'Failed to update violation'
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        'Failed to update violation'
      );
    }
  };

  // =====================================================
  // ADMIN - RESOLVE VIOLATION
  // =====================================================

  const resolveViolation = async (
    violationId
  ) => {

    const notes = window.prompt(
      'Enter resolution notes:'
    );

    if (notes === null) {
      return;
    }

    if (!notes.trim()) {
      setError(
        'Resolution notes are required.'
      );
      return;
    }

    try {

      setMessage('');
      setError('');

      const response =
        await violationService.resolveViolation(
          violationId,
          notes.trim()
        );

      if (response.status === 'success') {

        setMessage(
          'Violation resolved successfully.'
        );

        await loadViolations();

      } else {

        setError(
          response.message ||
          'Failed to resolve violation'
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        'Failed to resolve violation'
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="container-fluid p-4">

        <h3>
          🚨 Violation Management
        </h3>

        <p className="text-muted">
          Loading violations...
        </p>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="mb-1">
            🚨 Violation Management
          </h3>

          <p className="text-muted mb-0">

            {isSecurity
              ? 'Report and monitor parking violations'
              : 'Review and resolve parking violations'}

          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadViolations}
        >
          🔄 Refresh
        </button>

      </div>

      {/* SUCCESS */}
      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* =================================================
          SECURITY - REPORT VIOLATION FORM
          ================================================= */}

      {isSecurity && (
        <div className="card shadow-sm mb-4">

          <div className="card-header">
            <h5 className="mb-0">
              🚨 Report Violation
            </h5>
          </div>

          <div className="card-body">

            <form onSubmit={handleReportViolation}>

              <div className="row">

                {/* Registration Number */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Vehicle Registration Number
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="registration_number"
                    placeholder="e.g. TN07AB5678"
                    value={
                      formData.registration_number
                    }
                    onChange={handleChange}
                  />

                </div>

                {/* Violation Type */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Violation Type
                  </label>

                  <select
                    className="form-select"
                    name="violation_type"
                    value={
                      formData.violation_type
                    }
                    onChange={handleChange}
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
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Severity
                  </label>

                  <select
                    className="form-select"
                    name="severity"
                    value={
                      formData.severity
                    }
                    onChange={handleChange}
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

                {/* Location */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Location
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    placeholder="e.g. Main Campus Parking"
                    value={
                      formData.location
                    }
                    onChange={handleChange}
                  />

                </div>

                {/* Description */}
                <div className="col-12 mb-3">

                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    placeholder="Describe the violation"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

              <button
                type="submit"
                className="btn btn-danger"
                disabled={submitting}
              >
                {submitting
                  ? 'Reporting...'
                  : '🚨 Report Violation'}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          VIOLATION LIST
          ================================================= */}

      <div className="card shadow-sm">

        <div className="card-header">
          <h5 className="mb-0">
            📋 Reported Violations
          </h5>
        </div>

        <div className="card-body">

          {violations.length === 0 ? (

            <div className="alert alert-secondary mb-0">
              No violations recorded.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Owner</th>
                    <th>Violation</th>
                    <th>Severity</th>
                    <th>Location</th>
                    <th>Status</th>

                    {isAdmin && (
                      <th>Actions</th>
                    )}

                  </tr>

                </thead>

                <tbody>

                  {violations.map(
                    (violation) => (

                      <tr
                        key={violation.id}
                      >

                        <td>
                          #{violation.id}
                        </td>

                        <td>
                          <strong>
                            {
                              violation.registration_number
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            violation.owner_name ||
                            'Unknown'
                          }
                        </td>

                        <td>

                          <strong>
                            {
                              violation.violation_type
                            }
                          </strong>

                          <br />

                          <small className="text-muted">
                            {
                              violation.description
                            }
                          </small>

                        </td>

                        <td>

                          <span
                            className={
                              `badge ${
                                violation.severity ===
                                'High'
                                  ? 'bg-danger'
                                  : violation.severity ===
                                    'Medium'
                                  ? 'bg-warning text-dark'
                                  : 'bg-success'
                              }`
                            }
                          >
                            {
                              violation.severity
                            }
                          </span>

                        </td>

                        <td>
                          {
                            violation.location ||
                            '-'
                          }
                        </td>

                        <td>

                          <span
                            className={
                              `badge ${
                                violation.status ===
                                'Resolved'
                                  ? 'bg-success'
                                  : violation.status ===
                                    'Under Review'
                                  ? 'bg-warning text-dark'
                                  : 'bg-danger'
                              }`
                            }
                          >
                            {
                              violation.status
                            }
                          </span>

                        </td>

                        {/* ADMIN ACTIONS ONLY */}

                        {isAdmin && (

                          <td>

                            <div className="d-flex gap-2 flex-wrap">

                              {violation.status ===
                                'Open' && (

                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() =>
                                    updateStatus(
                                      violation.id,
                                      'Under Review'
                                    )
                                  }
                                >
                                  🔎 Review
                                </button>

                              )}

                              {violation.status !==
                                'Resolved' && (

                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    resolveViolation(
                                      violation.id
                                    )
                                  }
                                >
                                  ✅ Resolve
                                </button>

                              )}

                              {violation.status ===
                                'Resolved' && (

                                <span className="text-success small">
                                  ✓ Resolved
                                </span>

                              )}

                            </div>

                          </td>

                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default ViolationManagement;