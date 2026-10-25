<?php
/**
 * Get Reservations API
 * GET /api/reservations/get_reservations.php
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get user's reservations with related data
    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.status,
            r.reservation_start,
            r.reservation_end,
            r.created_at,
            r.cancellation_reason,
            v.id as vehicle_id,
            v.registration_number,
            v.model,
            v.color,
            ps.id as parking_slot_id,
            ps.slot_number,
            ps.floor,
            ps.slot_type,
            ps.status as slot_status,
            pz.zone_name,
            pz.zone_code
        FROM reservations r
        JOIN vehicles v ON r.vehicle_id = v.id
        JOIN parking_slots ps ON r.parking_slot_id = ps.id
        JOIN parking_zones pz ON ps.zone_id = pz.id
        WHERE r.user_id = ?
        ORDER BY r.reservation_start DESC
        LIMIT 100
    ");
    $stmt->execute([$user['user_id']]);
    $reservations = $stmt->fetchAll();

    // Get reservation statistics
    $stmt = $pdo->prepare("
        SELECT 
            status,
            COUNT(*) as count
        FROM reservations
        WHERE user_id = ?
        GROUP BY status
    ");
    $stmt->execute([$user['user_id']]);
    $stats = $stmt->fetchAll();

    $status_summary = [];
    foreach ($stats as $stat) {
        $status_summary[$stat['status']] = $stat['count'];
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $reservations,
        'statistics' => $status_summary,
        'count' => count($reservations)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get reservations error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch reservations']);
}
