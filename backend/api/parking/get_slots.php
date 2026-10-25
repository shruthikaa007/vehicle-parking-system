<?php
/**
 * Get Parking Slots API
 * GET /api/parking/get_slots.php?zone_id=1&slot_type=General&status=Available
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Build query with filters
    $query = "
        SELECT 
            ps.id,
            ps.slot_number,
            ps.floor,
            ps.slot_type,
            ps.status,
            pz.id as zone_id,
            pz.zone_name,
            pz.zone_code,
            COUNT(CASE WHEN r.status IN ('Active', 'Completed') THEN 1 END) as active_reservations
        FROM parking_slots ps
        JOIN parking_zones pz ON ps.zone_id = pz.id
        LEFT JOIN reservations r ON ps.id = r.parking_slot_id
        WHERE ps.is_active = TRUE
    ";
    
    $params = [];

    // Filter by zone
    if (!empty($_GET['zone_id'])) {
        $zone_id = (int)$_GET['zone_id'];
        $query .= " AND pz.id = ?";
        $params[] = $zone_id;
    }

    // Filter by slot type
    if (!empty($_GET['slot_type'])) {
        $slot_type = sanitizeInput($_GET['slot_type']);
        $valid_types = ['General', 'Staff', 'Accessible', 'Electric Vehicle'];
        if (in_array($slot_type, $valid_types)) {
            $query .= " AND ps.slot_type = ?";
            $params[] = $slot_type;
        }
    }

    // Filter by status
    if (!empty($_GET['status'])) {
        $status = sanitizeInput($_GET['status']);
        $valid_statuses = ['Available', 'Reserved', 'Occupied', 'Maintenance'];
        if (in_array($status, $valid_statuses)) {
            $query .= " AND ps.status = ?";
            $params[] = $status;
        }
    }

    $query .= " GROUP BY ps.id ORDER BY pz.zone_code, ps.slot_number";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $slots = $stmt->fetchAll();

    // Get zone statistics
    $stmt = $pdo->prepare("
        SELECT 
            pz.id,
            pz.zone_name,
            COUNT(ps.id) as total_slots,
            SUM(CASE WHEN ps.status = 'Available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN ps.status = 'Reserved' THEN 1 ELSE 0 END) as reserved,
            SUM(CASE WHEN ps.status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
            SUM(CASE WHEN ps.status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance
        FROM parking_zones pz
        LEFT JOIN parking_slots ps ON pz.id = ps.zone_id AND ps.is_active = TRUE
        GROUP BY pz.id
        ORDER BY pz.zone_name
    ");
    $stmt->execute();
    $zone_stats = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => [
            'slots' => $slots,
            'zone_statistics' => $zone_stats
        ],
        'count' => count($slots)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get slots error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch parking slots']);
}
