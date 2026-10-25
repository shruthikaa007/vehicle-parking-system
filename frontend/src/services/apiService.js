/**
 * API Service for Frontend
 * Handles all communication with PHP backend
 */

const API_BASE_URL = 'http://localhost/vehicle-parking-system/backend/api';

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'API request failed');
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


// =====================================================
// AUTH SERVICE
// =====================================================

export const authService = {
  login: async (email, password) => {
    return apiRequest('/auth/login.php', 'POST', {
      email,
      password,
    });
  },

  register: async (data) => {
    return apiRequest('/auth/register.php', 'POST', data);
  },

  logout: async () => {
    return apiRequest('/auth/logout.php', 'POST');
  },
};


// =====================================================
// VEHICLE SERVICE
// =====================================================

export const vehicleService = {
  getVehicles: async () => {
    return apiRequest('/vehicles/get_vehicles.php', 'GET');
  },

  addVehicle: async (formData) => {
    const options = {
      method: 'POST',
      credentials: 'include',
      body: formData,
    };

    const response = await fetch(
      `${API_BASE_URL}/vehicles/add_vehicle.php`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add vehicle');
    }

    return data;
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    return apiRequest(
      `/vehicles/update_vehicle.php?id=${vehicleId}`,
      'PUT',
      vehicleData
    );
  },

  deleteVehicle: async (vehicleId) => {
    return apiRequest(
      `/vehicles/delete_vehicle.php?id=${vehicleId}`,
      'DELETE'
    );
  },

  verifyVehicle: async (
    vehicleId,
    status,
    rejectionReason = null
  ) => {
    return apiRequest('/vehicles/verify_vehicle.php', 'POST', {
      vehicle_id: vehicleId,
      verification_status: status,
      rejection_reason: rejectionReason,
    });
  },
};


// =====================================================
// PARKING SERVICE
// =====================================================

export const parkingService = {
  getSlots: async (filters = {}) => {
    const params = new URLSearchParams(filters);

    return apiRequest(
      `/parking/get_slots.php?${params.toString()}`,
      'GET'
    );
  },

  addSlot: async (slotData) => {
    return apiRequest(
      '/parking/add_slot.php',
      'POST',
      slotData
    );
  },

  updateSlot: async (slotId, slotData) => {
    return apiRequest(
      `/parking/update_slot.php?id=${slotId}`,
      'PUT',
      slotData
    );
  },
};


// =====================================================
// RESERVATION SERVICE
// =====================================================

export const reservationService = {
  createReservation: async (reservationData) => {
    return apiRequest(
      '/reservations/create_reservation.php',
      'POST',
      reservationData
    );
  },

  getReservations: async () => {
    return apiRequest(
      '/reservations/get_reservations.php',
      'GET'
    );
  },

  cancelReservation: async (
    reservationId,
    reason
  ) => {
    return apiRequest(
      `/reservations/cancel_reservation.php?id=${reservationId}`,
      'DELETE',
      {
        cancellation_reason: reason,
      }
    );
  },
};


// =====================================================
// SECURITY SERVICE
// =====================================================

export const securityService = {
  searchVehicle: async (registrationNumber) => {
    return apiRequest(
      `/security/search_vehicle.php?reg=${encodeURIComponent(
        registrationNumber
      )}`,
      'GET'
    );
  },

  recordEntry: async (entryData) => {
    return apiRequest(
      '/security/record_entry.php',
      'POST',
      entryData
    );
  },

  recordExit: async (exitData) => {
    return apiRequest(
      '/security/record_exit.php',
      'POST',
      exitData
    );
  },

  getEntryExitLogs: async () => {
    return apiRequest(
      '/security/get_entry_exit_logs.php',
      'GET'
    );
  },
};


// =====================================================
// VIOLATION SERVICE
// =====================================================

export const violationService = {
  createViolation: async (violationData) => {
    return apiRequest(
      '/violations/create_violation.php',
      'POST',
      violationData
    );
  },

  getViolations: async () => {
    return apiRequest(
      '/violations/get_violations.php',
      'GET'
    );
  },

  updateViolation: async (
    violationId,
    violationData
  ) => {
    return apiRequest(
      `/violations/update_violation.php?id=${violationId}`,
      'PUT',
      violationData
    );
  },

  resolveViolation: async (
    violationId,
    notes
  ) => {
    return apiRequest(
      `/violations/resolve_violation.php?id=${violationId}`,
      'POST',
      {
        resolution_notes: notes,
      }
    );
  },
};
// =====================================================
// NOTIFICATION SERVICE
// =====================================================

export const notificationService = {
  getNotifications: async () => {
    return apiRequest(
      '/notifications/get_notifications.php',
      'GET'
    );
  },

  markAsRead: async (notificationId) => {
    return apiRequest(
      `/notifications/mark_notification_read.php?id=${notificationId}`,
      'POST'
    );
  },
};


// =====================================================
// DASHBOARD SERVICE
// =====================================================

export const dashboardService = {
  getStatistics: async () => {
    return apiRequest(
      '/dashboard/get_dashboard_statistics.php',
      'GET'
    );
  },

  getReports: async () => {
    return apiRequest(
      '/dashboard/get_reports.php',
      'GET'
    );
  },
};