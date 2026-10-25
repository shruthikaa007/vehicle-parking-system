import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/apiService';

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getReservations();
      setReservations(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4"><div className="spinner-border"></div></div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">📋 My Reservations</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {reservations.length === 0 ? (
        <div className="alert alert-info">
          No reservations yet. <a href="/make-reservation">Make one</a>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Vehicle</th>
                <th>Slot</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id}>
                  <td>{res.registration_number}</td>
                  <td>{res.zone_name}</td>
                  <td>{new Date(res.reservation_start).toLocaleString()}</td>
                  <td>{new Date(res.reservation_end).toLocaleString()}</td>
                  <td>
                    <span className={`badge bg-${res.status === 'Active' ? 'success' : 'secondary'}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyReservations;
