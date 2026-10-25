<?php
/**
 * Create Violation API
 * POST /api/violations/create_violation.php
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
$required_fields = ['registration_number', 'violation_type', 'severity', 'description', 'location'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field '{$field}' is required"]);
        exit;
    }
}

$registration_number = strtoupper(sanitizeInput($input['registration_number']));
$violation_type = sanitizeInput($input['violation_type']);
$severity = sanitizeInput($input['severity']);
$description = sanitizeInput($input['description']);
$location = sanitizeInput($input['location']);

// Validate violation type
$valid_types = ['Unauthorized Parking', 'Overstay', 'Wrong Parking Slot', 'Unregistered Vehicle', 'Expired Reservation', 'Other'];
if (!in_array($violation_type, $valid_types)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid violation type']);
    exit;
}

// Validate severity
$valid_severities = ['Low', 'Medium', 'High'];
if (!in_array($severity, $valid_severities)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid severity level']);
    exit;
}

try {
    // Find vehicle by registration number
    $vehicle_id = null;
    $user_id = null;
    $stmt = $pdo->prepare("
        SELECT v.id, v.user_id FROM vehicles v
        WHERE v.registration_number = ? AND v.is_active = TRUE
    ");
    $stmt->execute([$registration_number]);
    $vehicle = $stmt->fetch();
    
    if ($vehicle) {
        $vehicle_id = $vehicle['id'];
        $user_id = $vehicle['user_id'];
    }

    // Create violation
    $stmt = $pdo->prepare("
        INSERT INTO violations 
        (vehicle_id, registration_number, user_id, violation_type, severity, description, location, status, reported_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?)
    ");
    $stmt->execute([
        $vehicle_id,
        $registration_number,
        $user_id,
        $violation_type,
        $severity,
        $description,
        $location,
        $user['user_id']
    ]);
    
    $violation_id = $pdo->lastInsertId();

    // Log audit
    logAudit($user['user_id'], 'CREATE', 'Violation', $violation_id, [
        'registration_number' => $registration_number,
        'violation_type' => $violation_type,
        'severity' => $severity,
        'location' => $location
    ]);

    // Send notification to vehicle owner if exists
    if ($user_id) {
        sendNotification($user_id, 'Violation Reported',
            "A {$severity} severity violation ({$violation_type}) has been recorded for your vehicle {$registration_number} at {$location}.",
            'Violation', $violation_id);
    }

    // Send notification to admins
    $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin'");
    $stmt->execute();
    $admins = $stmt->fetchAll();
    foreach ($admins as $admin) {
        sendNotification($admin['id'], 'New Violation Report',
            "A new {$severity} violation ({$violation_type}) has been reported for vehicle {$registration_number}.",
            'Violation', $violation_id);
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Violation created successfully',
        'data' => [
            'violation_id' => $violation_id,
            'registration_number' => $registration_number,
            'violation_type' => $violation_type,
            'severity' => $severity,
            'status' => 'Open',
            'reported_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Create violation error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to create violation']);
}
