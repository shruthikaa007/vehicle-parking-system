<?php

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$resolution_notes = isset($input['resolution_notes'])
    ? trim($input['resolution_notes'])
    : '';

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

    // Update violation
    $stmt = $pdo->prepare("
        UPDATE violations
        SET
            status = 'Resolved',
            resolution_notes = ?,
            resolved_by = ?,
            resolved_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $resolution_notes,
        $user['id'],
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
        'Resolve Violation',
        'violation',
        $violation_id,
        json_encode([
            'resolution_notes' => $resolution_notes
        ])
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Violation resolved successfully'
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    error_log("Resolve violation error: " . $e->getMessage());

    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to resolve violation'
    ]);
}
?>