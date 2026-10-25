<?php
/**
 * Get Violations API
 * GET /api/violations/get_violations.php
 */

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['security', 'admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT
            v.id,
            v.vehicle_id,
            v.registration_number,
            v.user_id,
            v.violation_type,
            v.severity,
            v.description,
            v.location,
            v.status,
            v.reported_by,
            v.created_at,
            u.name AS owner_name,
            u.email AS owner_email
        FROM violations v
        LEFT JOIN users u ON v.user_id = u.id
        ORDER BY v.created_at DESC
    ");

    $stmt->execute();

    $violations = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $violations,
        'count' => count($violations)
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    error_log("Get violations error: " . $e->getMessage());

    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch violations'
    ]);
}