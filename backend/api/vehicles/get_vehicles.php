<?php
/**
 * Get Vehicles API
 * GET /api/vehicles/get_vehicles.php
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {

    // Admin can view all active vehicles
    if ($user['role'] === 'admin') {

        $stmt = $pdo->prepare("
            SELECT 
                v.id,
                v.registration_number,
                v.vehicle_type,
                v.model,
                v.color,
                v.verification_status,
                v.rejection_reason,
                v.verified_at,
                v.is_active,
                v.created_at,
                u.name AS owner_name,
                u.email AS owner_email,
                u.registration_id AS owner_registration_id
            FROM vehicles v
            JOIN users u ON v.user_id = u.id
            WHERE v.is_active = TRUE
            ORDER BY v.created_at DESC
        ");

        $stmt->execute();
        $vehicles = $stmt->fetchAll();

    } else {

        // Students/Staff can view only their own vehicles
        $stmt = $pdo->prepare("
            SELECT 
                id,
                registration_number,
                vehicle_type,
                model,
                color,
                verification_status,
                rejection_reason,
                verified_at,
                is_active,
                created_at
            FROM vehicles
            WHERE user_id = ? AND is_active = TRUE
            ORDER BY created_at DESC
        ");

        $stmt->execute([$user['user_id']]);
        $vehicles = $stmt->fetchAll();
    }

    http_response_code(200);

    echo json_encode([
        'status' => 'success',
        'data' => $vehicles,
        'count' => count($vehicles)
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    error_log("Get vehicles error: " . $e->getMessage());

    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch vehicles'
    ]);
}
?>