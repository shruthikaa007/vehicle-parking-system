<?php
/**
 * User Login API
 * POST /api/login.php
 */

require_once('../config/database.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Email and password are required'
    ]);
    exit;
}

$email = sanitizeInput($input['email']);
$password = $input['password'];

try {

    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            email,
            phone,
            registration_id,
            password_hash,
            role,
            department,
            is_active,
            is_verified
        FROM users
        WHERE email = ? AND is_active = TRUE
    ");

    $stmt->execute([$email]);

    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email or password'
        ]);

        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);

        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email or password'
        ]);

        exit;
    }

    // Store logged-in user information in PHP session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['registration_id'] = $user['registration_id'];
    $_SESSION['login_time'] = time();

    // Record login in audit logs
    logAudit(
        $user['id'],
        'LOGIN',
        'Session',
        null,
        [
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]
    );

    http_response_code(200);

    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'data' => [
            'user_id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'registration_id' => $user['registration_id'],
            'is_verified' => (bool)$user['is_verified']
        ]
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    error_log("Login error: " . $e->getMessage());

    echo json_encode([
        'status' => 'error',
        'message' => 'Login failed'
    ]);
}
?>