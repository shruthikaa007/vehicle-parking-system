import React, { useState } from 'react';
import { vehicleService } from '../services/apiService';

function VehicleRegistration() {
  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_type: 'Car',
    model: '',
    color: '',
    vehicle_document: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      vehicle_document: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.registration_number || !formData.model || !formData.color) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('registration_number', formData.registration_number);
      data.append('vehicle_type', formData.vehicle_type);
      data.append('model', formData.model);
      data.append('color', formData.color);
      if (formData.vehicle_document) {
        data.append('vehicle_document', formData.vehicle_document);
      }

      const response = await vehicleService.addVehicle(data);
      setSuccess('Vehicle registered successfully! Admin will verify soon.');
      setFormData({
        registration_number: '',
        vehicle_type: 'Car',
        model: '',
        color: '',
        vehicle_document: null,
      });
    } catch (err) {
      setError(err.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">🚗 Register Your Vehicle</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Vehicle Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Registration Number <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    placeholder="e.g., TN07AB1234"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Vehicle Type <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                  >
                    <option>Car</option>
                    <option>Motorcycle</option>
                    <option>Scooter</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Model <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota Fortuner"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Color <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Silver"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Vehicle Document (PDF/Image)</label>
                  <input
                    type="file"
                    className="form-control"
                    name="vehicle_document"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <small className="text-muted">Max size: 5MB</small>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register Vehicle'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>📋 Instructions</h5>
            </div>
            <div className="card-body">
              <p><strong>Required Information:</strong></p>
              <ul>
                <li>Valid vehicle registration number</li>
                <li>Vehicle type (Car, Motorcycle, etc.)</li>
                <li>Vehicle model/name</li>
                <li>Vehicle color</li>
              </ul>

              <p className="mt-3"><strong>Verification Process:</strong></p>
              <ol>
                <li>Submit your vehicle details</li>
                <li>Admin will verify the information</li>
                <li>You'll receive notification when verified</li>
                <li>After verification, you can make reservations</li>
              </ol>

              <div className="alert alert-info mt-3">
                <strong>Note:</strong> Vehicle verification may take 24-48 hours. Only verified vehicles can be used for parking reservations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleRegistration;
