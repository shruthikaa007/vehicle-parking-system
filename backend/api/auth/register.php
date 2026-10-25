<?php
/**
 * User Registration API
 * POST /api/register.php
 */

require_once('../config/database.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'phone', 'registration_id', 'password', 'confirm_password', 'role', 'department'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field '{$field}' is required"]);
        exit;
    }
}

// Sanitize inputs
$name = sanitizeInput($input['name']);
$email = sanitizeInput($input['email']);
$phone = sanitizeInput($input['phone']);
$registration_id = sanitizeInput($input['registration_id']);
$password = $input['password']; // Don't sanitize password
$confirm_password = $input['confirm_password'];
$role = sanitizeInput($input['role']);
$department = sanitizeInput($input['department']);

// Validate email format
if (!isValidEmail($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
    exit;
}

// Validate phone format
if (!isValidPhone($phone)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid phone number']);
    exit;
}

// Validate password
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters']);
    exit;
}

// Check password match
if ($password !== $confirm_password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match']);
    exit;
}

// Validate role
$valid_roles = ['student', 'staff', 'security', 'admin'];
if (!in_array($role, $valid_roles)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid role']);
    exit;
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Email already registered']);
        exit;
    }

    // Check if registration_id already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE registration_id = ?");
    $stmt->execute([$registration_id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Registration ID already exists']);
        exit;
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, phone, registration_id, password_hash, role, department)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $phone, $registration_id, $password_hash, $role, $department]);
    
    $user_id = $pdo->lastInsertId();

    // Log audit
    logAudit($user_id, 'CREATE', 'User', $user_id, [
        'email' => $email,
        'role' => $role
    ]);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Registration successful',
        'data' => [
            'user_id' => $user_id,
            'email' => $email,
            'role' => $role
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Registration failed']);
}
