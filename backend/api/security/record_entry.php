<?php
/**
 * Record Vehicle Entry API
 * POST /api/security/record_entry.php
 */

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['security', 'admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['registration_number', 'gate_name', 'verification_result'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field '{$field}' is required"]);
        exit;
    }
}

$registration_number = strtoupper(sanitizeInput($input['registration_number']));
$gate_name = sanitizeInput($input['gate_name']);
$verification_result = sanitizeInput($input['verification_result']);

// Validate verification result
$valid_results = ['Cleared', 'Flagged', 'Under Review'];
if (!in_array($verification_result, $valid_results)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid verification result']);
    exit;
}

try {
    // Find vehicle by registration number
    $stmt = $pdo->prepare("
        SELECT v.id, v.user_id, v.verification_status, u.name, u.email
        FROM vehicles v
        JOIN users u ON v.user_id = u.id
        WHERE v.registration_number = ? AND v.is_active = TRUE
    ");
    $stmt->execute([$registration_number]);
    $vehicle = $stmt->fetch();

    $vehicle_id = null;
    $vehicle_verified = false;
    $has_valid_reservation = false;
    $user_email = null;

    if ($vehicle) {
        $vehicle_id = $vehicle['id'];
        $vehicle_verified = ($vehicle['verification_status'] === 'Verified');
        $user_email = $vehicle['email'];

        // Check if vehicle has valid reservation
        $stmt = $pdo->prepare("
            SELECT r.id FROM reservations r
            WHERE r.vehicle_id = ? 
            AND r.status = 'Active'
            AND r.reservation_start <= NOW()
            AND r.reservation_end >= NOW()
            LIMIT 1
        ");
        $stmt->execute([$vehicle_id]);
        if ($stmt->fetch()) {
            $has_valid_reservation = true;
        }
    }

    // Record entry
    $stmt = $pdo->prepare("
        INSERT INTO entry_exit_logs 
        (vehicle_id, registration_number, entry_time, entry_gate, entry_verified_by, entry_verification_result)
        VALUES (?, ?, NOW(), ?, ?, ?)
    ");
    $stmt->execute([$vehicle_id, $registration_number, $gate_name, $user['user_id'], $verification_result]);
    
    $log_id = $pdo->lastInsertId();

    // Log audit
    logAudit($user['user_id'], 'CREATE', 'Entry_Log', $log_id, [
        'registration_number' => $registration_number,
        'gate' => $gate_name,
        'verification' => $verification_result
    ]);

    // If vehicle is flagged and not verified, create a violation
    if ($verification_result === 'Flagged' && !$vehicle_verified && $vehicle_id) {
        $stmt = $pdo->prepare("
            INSERT INTO violations 
            (vehicle_id, registration_number, user_id, violation_type, severity, description, location, status, reported_by)
            VALUES (?, ?, ?, 'Unregistered Vehicle', 'High', 'Vehicle entered without proper verification', ?, 'Open', ?)
        ");
        $stmt->execute([$vehicle_id, $registration_number, $vehicle['user_id'], $gate_name, $user['user_id']]);
    }

    // Send notification
    if ($vehicle_id && $user_email) {
        sendNotification($vehicle['user_id'], 'Vehicle Entry Recorded',
            "Your vehicle {$registration_number} was recorded at {$gate_name} gate at " . date('Y-m-d H:i:s'),
            'Entry/Exit', $log_id);
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Entry recorded successfully',
        'data' => [
            'log_id' => $log_id,
            'registration_number' => $registration_number,
            'vehicle_found' => $vehicle ? true : false,
            'vehicle_verified' => $vehicle_verified,
            'has_valid_reservation' => $has_valid_reservation,
            'verification_result' => $verification_result,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Record entry error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to record entry']);
}
