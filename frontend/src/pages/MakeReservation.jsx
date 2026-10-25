import React, { useState, useEffect } from 'react';
import {
  vehicleService,
  parkingService,
  reservationService
} from '../services/apiService';

function MakeReservation() {
  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    parking_slot_id: '',
    reservation_start: '',
    reservation_end: '',
  });

  const [filters, setFilters] = useState({
    zone_id: '',
    slot_type: '',
    status: 'Available',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [vehiclesRes, slotsRes] = await Promise.all([
        vehicleService.getVehicles(),
        parkingService.getSlots(filters),
      ]);

      setVehicles(
        vehiclesRes.data.filter(
          (vehicle) => vehicle.verification_status === 'Verified'
        )
      );

      setSlots(slotsRes.data.slots || []);
    } catch (err) {
      setError(err.message || 'Failed to load reservation data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    // Validation
    if (
      !formData.vehicle_id ||
      !formData.parking_slot_id ||
      !formData.reservation_start ||
      !formData.reservation_end
    ) {
      setError('All fields are required');
      return;
    }

    const startTime = new Date(formData.reservation_start);
    const endTime = new Date(formData.reservation_end);
    const now = new Date();

    if (startTime <= now) {
      setError('Reservation start time must be in the future');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);

      const response = await reservationService.createReservation({
        vehicle_id: parseInt(formData.vehicle_id),
        parking_slot_id: parseInt(formData.parking_slot_id),
        reservation_start:
          formData.reservation_start.replace('T', ' '),
        reservation_end:
          formData.reservation_end.replace('T', ' '),
      });

      setSuccess(
        response?.message || 'Reservation created successfully!'
      );

      setFormData({
        vehicle_id: '',
        parking_slot_id: '',
        reservation_start: '',
        reservation_end: '',
      });

      // Refresh slots after reservation
      setTimeout(() => {
        fetchData();
      }, 2000);

    } catch (err) {
      setError(
        err.message || 'Failed to create reservation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="make-reservation-container p-4">

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2>📅 Make a Reservation</h2>

          <p className="text-muted">
            Book a parking slot for your vehicle
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row">

        {/* Filters */}
        <div className="col-md-3 mb-4">

          <div className="card">

            <div className="card-header">
              <h5 className="mb-0">Filters</h5>
            </div>

            <div className="card-body">

              {/* Zone Filter */}
              <div className="mb-3">

                <label className="form-label">
                  Zone
                </label>

                <select
                  className="form-select"
                  name="zone_id"
                  value={filters.zone_id}
                  onChange={handleFilterChange}
                >
                  <option value="">
                    All Zones
                  </option>

                  <option value="1">
                    Zone A - Main Campus
                  </option>

                  <option value="2">
                    Zone B - Administrative
                  </option>

                  <option value="3">
                    Zone C - Sports Complex
                  </option>

                  <option value="4">
                    Zone D - Hostels
                  </option>

                  <option value="5">
                    Zone E - Faculty Quarters
                  </option>
                </select>

              </div>

              {/* Slot Type Filter */}
              <div className="mb-3">

                <label className="form-label">
                  Slot Type
                </label>

                <select
                  className="form-select"
                  name="slot_type"
                  value={filters.slot_type}
                  onChange={handleFilterChange}
                >

                  <option value="">
                    All Types
                  </option>

                  <option value="General">
                    General
                  </option>

                  <option value="Staff">
                    Staff
                  </option>

                  <option value="Accessible">
                    Accessible
                  </option>

                  <option value="Electric Vehicle">
                    Electric Vehicle
                  </option>

                </select>

              </div>

              {/* Status Filter */}
              <div className="mb-3">

                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >

                  <option value="Available">
                    Available
                  </option>

                  <option value="">
                    All Statuses
                  </option>

                </select>

              </div>

            </div>
          </div>

        </div>

        {/* Reservation Form */}
        <div className="col-md-9 mb-4">

          <div className="card">

            <div className="card-header">
              <h5 className="mb-0">
                Reservation Details
              </h5>
            </div>

            <div className="card-body">

              <form onSubmit={handleSubmit}>

                {/* Vehicle + Parking Slot */}
                <div className="row mb-3">

                  {/* Vehicle */}
                  <div className="col-md-6">

                    <label className="form-label">
                      Vehicle{' '}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <select
                      className="form-select"
                      name="vehicle_id"
                      value={formData.vehicle_id}
                      onChange={handleInputChange}
                      required
                    >

                      <option value="">
                        Select a vehicle
                      </option>

                      {vehicles.map((vehicle) => (
                        <option
                          key={vehicle.id}
                          value={vehicle.id}
                        >
                          {vehicle.registration_number} -{' '}
                          {vehicle.model}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* Parking Slot */}
                  <div className="col-md-6">

                    <label className="form-label">
                      Parking Slot{' '}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <select
                      className="form-select"
                      name="parking_slot_id"
                      value={formData.parking_slot_id}
                      onChange={handleInputChange}
                      required
                    >

                      <option value="">
                        Select a slot
                      </option>

                      {slots.map((slot) => (
                        <option
                          key={slot.id}
                          value={slot.id}
                        >
                          {slot.zone_name} -{' '}
                          {slot.slot_number} ({slot.slot_type})
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

                {/* Date and Time */}
                <div className="row mb-3">

                  {/* Start */}
                  <div className="col-md-6">

                    <label className="form-label">
                      Start Date &amp; Time{' '}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="datetime-local"
                      className="form-control"
                      name="reservation_start"
                      value={formData.reservation_start}
                      onChange={handleInputChange}
                      required
                    />

                  </div>

                  {/* End */}
                  <div className="col-md-6">

                    <label className="form-label">
                      End Date &amp; Time{' '}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="datetime-local"
                      className="form-control"
                      name="reservation_end"
                      value={formData.reservation_end}
                      onChange={handleInputChange}
                      required
                    />

                  </div>

                </div>

                {/* Information */}
                <div
                  className="alert alert-info"
                  role="alert"
                >
                  <strong>Note:</strong>{' '}
                  Your reservation is subject to verification
                  by campus security. Overlapping reservations
                  for the same slot are automatically prevented.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? 'Creating Reservation...'
                    : 'Create Reservation'}
                </button>

              </form>

            </div>
          </div>

          {/* Available Slots */}
          <div className="card mt-4">

            <div className="card-header">
              <h5 className="mb-0">
                Available Slots ({slots.length})
              </h5>
            </div>

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover table-sm">

                  <thead className="table-light">

                    <tr>
                      <th>Zone</th>
                      <th>Slot</th>
                      <th>Floor</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {slots.length > 0 ? (

                      slots.map((slot) => (

                        <tr key={slot.id}>

                          <td>
                            {slot.zone_name}
                          </td>

                          <td>
                            <strong>
                              {slot.slot_number}
                            </strong>
                          </td>

                          <td>
                            {slot.floor}
                          </td>

                          <td>
                            {slot.slot_type}
                          </td>

                          <td>

                            <span
                              className={`badge ${
                                slot.status === 'Available'
                                  ? 'bg-success'
                                  : 'bg-warning'
                              }`}
                            >
                              {slot.status}
                            </span>

                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan="5"
                          className="text-center text-muted"
                        >
                          {loading
                            ? 'Loading parking slots...'
                            : 'No available slots matching your filters'}
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default MakeReservation;