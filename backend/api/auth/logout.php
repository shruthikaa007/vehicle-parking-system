<?php
/**
 * Logout API
 * POST /api/auth/logout.php
 */

require_once('../config/database.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get user before destroying session
    $user_id = $_SESSION['user_id'] ?? null;

    // Log audit
    if ($user_id) {
        logAudit($user_id, 'LOGOUT', 'Session', null, [
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'session_duration' => isset($_SESSION['login_time']) ? time() - $_SESSION['login_time'] : null
        ]);
    }

    // Destroy session
    session_destroy();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Logged out successfully'
    ]);

} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Logout failed']);
}
s