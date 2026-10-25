<?php
/**
 * Verify Vehicle API
 * POST /api/vehicles/verify_vehicle.php
 */

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['vehicle_id', 'verification_status'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field '{$field}' is required"]);
        exit;
    }
}

$vehicle_id = (int)$input['vehicle_id'];
$verification_status = sanitizeInput($input['verification_status']);
$rejection_reason = sanitizeInput($input['rejection_reason'] ?? '');

// Validate verification status
$valid_statuses = ['Verified', 'Rejected'];
if (!in_array($verification_status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid verification status']);
    exit;
}

// Rejection reason required if rejecting
if ($verification_status === 'Rejected' && empty($rejection_reason)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Rejection reason is required']);
    exit;
}

try {
    // Get vehicle and owner info
    $stmt = $pdo->prepare("
        SELECT v.id, v.registration_number, v.user_id, u.email, u.name
        FROM vehicles v
        JOIN users u ON v.user_id = u.id
        WHERE v.id = ?
    ");
    $stmt->execute([$vehicle_id]);
    $vehicle = $stmt->fetch();

    if (!$vehicle) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Vehicle not found']);
        exit;
    }

    // Update vehicle verification status
    $stmt = $pdo->prepare("
        UPDATE vehicles
        SET verification_status = ?,
            rejection_reason = ?,
            verified_at = NOW(),
            verified_by = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([
        $verification_status,
        $rejection_reason,
        $user['user_id'],
        $vehicle_id
    ]);

    // Log audit
    logAudit($user['user_id'], 'UPDATE', 'Vehicle_Verification', $vehicle_id, [
        'registration_number' => $vehicle['registration_number'],
        'verification_status' => $verification_status,
        'rejection_reason' => $rejection_reason
    ]);

    // Send notification to vehicle owner
    $message = $verification_status === 'Verified'
        ? "Your vehicle {$vehicle['registration_number']} has been verified successfully!"
        : "Your vehicle {$vehicle['registration_number']} registration was rejected. Reason: {$rejection_reason}";
    
    $title = $verification_status === 'Verified'
        ? 'Vehicle Verified'
        : 'Vehicle Registration Rejected';

    sendNotification($vehicle['user_id'], $title, $message, 'Vehicle', $vehicle_id);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => "Vehicle {$verification_status}",
        'data' => [
            'vehicle_id' => $vehicle_id,
            'registration_number' => $vehicle['registration_number'],
            'verification_status' => $verification_status,
            'verified_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Verify vehicle error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to verify vehicle']);
}
