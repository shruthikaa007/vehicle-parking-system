<?php
/**
 * Cancel Reservation API
 * DELETE /api/reservations/cancel_reservation.php?id={reservation_id}
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get reservation ID from query parameter
$reservation_id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$reservation_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Reservation ID is required']);
    exit;
}

// Get cancellation reason from request body
$input = json_decode(file_get_contents('php://input'), true);
$cancellation_reason = $input['cancellation_reason'] ?? 'User requested cancellation';

try {
    // Get reservation and verify ownership
    $stmt = $pdo->prepare("
        SELECT r.*, ps.id as slot_id FROM reservations r
        JOIN parking_slots ps ON r.parking_slot_id = ps.id
        WHERE r.id = ? AND r.user_id = ?
    ");
    $stmt->execute([$reservation_id, $user['user_id']]);
    $reservation = $stmt->fetch();

    if (!$reservation) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Reservation not found']);
        exit;
    }

    // Check if reservation can be cancelled
    if (!in_array($reservation['status'], ['Active', 'Completed'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Cannot cancel ' . $reservation['status'] . ' reservation']);
        exit;
    }

    // Update reservation status
    $stmt = $pdo->prepare("
        UPDATE reservations
        SET status = 'Cancelled',
            cancellation_reason = ?,
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$cancellation_reason, $reservation_id]);

    // Update parking slot status to Available
    $stmt = $pdo->prepare("
        UPDATE parking_slots
        SET status = 'Available'
        WHERE id = ?
    ");
    $stmt->execute([$reservation['slot_id']]);

    // Log audit
    logAudit($user['user_id'], 'DELETE', 'Reservation', $reservation_id, [
        'cancellation_reason' => $cancellation_reason
    ]);

    // Send cancellation notification
    sendNotification($user['user_id'], 'Reservation Cancelled',
        "Your reservation has been cancelled. Reason: {$cancellation_reason}",
        'Reservation', $reservation_id);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Reservation cancelled successfully',
        'data' => [
            'reservation_id' => $reservation_id,
            'new_status' => 'Cancelled',
            'cancelled_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Cancel reservation error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to cancel reservation']);
}
