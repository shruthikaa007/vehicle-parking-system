<?php
/**
 * Add Vehicle API
 * POST /api/vehicles/add_vehicle.php
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$registration_number = sanitizeInput($_POST['registration_number'] ?? '');
$vehicle_type = sanitizeInput($_POST['vehicle_type'] ?? '');
$model = sanitizeInput($_POST['model'] ?? '');
$color = sanitizeInput($_POST['color'] ?? '');

// Validate required fields
if (empty($registration_number) || empty($vehicle_type) || empty($model) || empty($color)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

// Validate vehicle type
$valid_types = ['Car', 'Motorcycle', 'Scooter', 'Other'];
if (!in_array($vehicle_type, $valid_types)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid vehicle type']);
    exit;
}

// Handle file upload
$document_path = null;
if (isset($_FILES['vehicle_document']) && $_FILES['vehicle_document']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['vehicle_document'];
    $upload_dir = '../uploads/vehicles/';
    
    // Create directory if not exists
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Validate file
    $allowed_types = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type']);
        exit;
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'File size exceeds 5MB']);
        exit;
    }

    // Generate unique filename
    $filename = time() . '_' . uniqid() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $document_path = 'uploads/vehicles/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $upload_dir . $filename)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'File upload failed']);
        exit;
    }
}

try {
    // Check if registration number already exists
    $stmt = $pdo->prepare("SELECT id FROM vehicles WHERE registration_number = ?");
    $stmt->execute([$registration_number]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Vehicle already registered']);
        exit;
    }

    // Insert vehicle
    $stmt = $pdo->prepare("
        INSERT INTO vehicles (user_id, registration_number, vehicle_type, model, color, document_path)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$user['user_id'], $registration_number, $vehicle_type, $model, $color, $document_path]);
    
    $vehicle_id = $pdo->lastInsertId();

    // Log audit
    logAudit($user['user_id'], 'CREATE', 'Vehicle', $vehicle_id, [
        'registration_number' => $registration_number,
        'vehicle_type' => $vehicle_type
    ]);

    // Send notification to admins
    $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin'");
    $stmt->execute();
    $admins = $stmt->fetchAll();
    foreach ($admins as $admin) {
        sendNotification($admin['id'], 'New Vehicle Registration', 
            "Vehicle {$registration_number} registered by {$user['name']}", 
            'Vehicle', $vehicle_id);
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Vehicle added successfully',
        'data' => [
            'vehicle_id' => $vehicle_id,
            'registration_number' => $registration_number,
            'verification_status' => 'Pending'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Add vehicle error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to add vehicle']);
}
