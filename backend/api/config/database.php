<?php
/**
 * Database Configuration
 * Campus Parking and Campus Access Management System
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'campus_parking');
define('DB_PORT', 3306);

try {
    // Create PDO connection with error handling
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        )
    );
} catch (PDOException $e) {
    // Return error response
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Enable sessions
session_start();

// Set headers for JSON responses
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Helper function to get logged-in user
 */
function getAuthUser() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
    return $_SESSION;
}

/**
 * Helper function to check user role
 */
function checkRole($allowedRoles) {
    $user = getAuthUser();
    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }
}

/**
 * Helper function to log audit entries
 */
function logAudit($user_id, $action, $entity_type, $entity_id = null, $details = null) {
    global $pdo;
    try {
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
        $details_json = $details ? json_encode($details) : null;
        
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $action, $entity_type, $entity_id, $details_json, $ip_address]);
    } catch (Exception $e) {
        // Log error but don't interrupt main operation
        error_log("Audit log error: " . $e->getMessage());
    }
}

/**
 * Helper function to send notification
 */
function sendNotification($user_id, $title, $message, $type, $related_id = null) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $title, $message, $type, $related_id]);
    } catch (Exception $e) {
        error_log("Notification error: " . $e->getMessage());
    }
}

/**
 * Helper function to validate input
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Helper function to validate email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Helper function to validate phone
 */
function isValidPhone($phone) {
    return preg_match('/^[0-9]{10}$/', preg_replace('/\D/', '', $phone));
}
