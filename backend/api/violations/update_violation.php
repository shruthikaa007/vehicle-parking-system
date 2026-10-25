<?php

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit;
}

$violation_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($violation_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid violation ID'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request data'
    ]);
    exit;
}

try {

    // Check whether violation exists
    $stmt = $pdo->prepare("
        SELECT id, status
        FROM violations
        WHERE id = ?
    ");

    $stmt->execute([$violation_id]);
    $violation = $stmt->fetch();

    if (!$violation) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Violation not found'
        ]);
        exit;
    }

    // Get new status
    $status = isset($input['status'])
        ? trim($input['status'])
        : '';

    $allowed_statuses = [
        'Open',
        'Under Review',
        'Resolved'
    ];

    if (!in_array($status, $allowed_statuses, true)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid violation status'
        ]);
        exit;
    }

    // Update status
    $stmt = $pdo->prepare("
        UPDATE violations
        SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");

    $stmt->execute([
        $status,
        $violation_id
    ]);

    // Audit log
    $stmt = $pdo->prepare("
        INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $user['id'],
        'Update Violation',
        'violation',
        $violation_id,
        json_encode([
            'old_status' => $violation['status'],
            'new_status' => $status
        ])
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Violation updated successfully'
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    error_log("Update violation error: " . $e->getMessage());

    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update violation'
    ]);
}

?>