import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/apiService';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4"><div className="spinner-border"></div></div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">🔔 Notifications</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {notifications.length === 0 ? (
        <div className="alert alert-info">No notifications</div>
      ) : (
        <div className="list-group">
          {notifications.map(notif => (
            <div key={notif.id} className="list-group-item">
              <h6 className="mb-1">{notif.title}</h6>
              <p className="mb-1">{notif.message}</p>
              <small className="text-muted">
                {new Date(notif.created_at).toLocaleString()}
                {!notif.is_read && <span className="badge bg-primary ms-2">New</span>}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
