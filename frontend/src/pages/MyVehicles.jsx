import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/apiService';

function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicles();
      setVehicles(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4"><div className="spinner-border"></div></div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">🚙 My Vehicles</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {vehicles.length === 0 ? (
        <div className="alert alert-info">
          No vehicles registered yet. <a href="/vehicle-registration">Register one now</a>
        </div>
      ) : (
        <div className="row">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{vehicle.registration_number}</h5>
                  <p className="card-text">
                    <strong>Type:</strong> {vehicle.vehicle_type}<br/>
                    <strong>Model:</strong> {vehicle.model}<br/>
                    <strong>Color:</strong> {vehicle.color}
                  </p>
                  <span className={`badge bg-${
                    vehicle.verification_status === 'Verified' ? 'success' :
                    vehicle.verification_status === 'Pending' ? 'warning' : 'danger'
                  }`}>
                    {vehicle.verification_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyVehicles;
