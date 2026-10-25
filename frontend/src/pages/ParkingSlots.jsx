import React, { useState, useEffect } from 'react';
import { parkingService } from '../services/apiService';

function ParkingSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await parkingService.getSlots();
      setSlots(response.data.slots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4"><div className="spinner-border"></div></div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">🅿️ Parking Slots</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Zone</th>
              <th>Slot #</th>
              <th>Floor</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id}>
                <td>{slot.zone_name}</td>
                <td><strong>{slot.slot_number}</strong></td>
                <td>{slot.floor}</td>
                <td>{slot.slot_type}</td>
                <td>
                  <span className={`badge bg-${slot.status === 'Available' ? 'success' : 'warning'}`}>
                    {slot.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParkingSlots;
