<?php
/**
 * Get Dashboard Statistics API
 * GET /api/dashboard/get_dashboard_statistics.php
 */

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['admin', 'security']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get overall statistics
    $stmt = $pdo->prepare("
        SELECT 
            (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'Verified' AND is_active = TRUE) as verified_vehicles,
            (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'Pending' AND is_active = TRUE) as pending_vehicles,
            (SELECT COUNT(*) FROM parking_slots WHERE status = 'Available' AND is_active = TRUE) as available_slots,
            (SELECT COUNT(*) FROM parking_slots WHERE status = 'Reserved' AND is_active = TRUE) as reserved_slots,
            (SELECT COUNT(*) FROM parking_slots WHERE status = 'Occupied' AND is_active = TRUE) as occupied_slots,
            (SELECT COUNT(*) FROM parking_slots WHERE status = 'Maintenance' AND is_active = TRUE) as maintenance_slots,
            (SELECT COUNT(*) FROM parking_slots WHERE is_active = TRUE) as total_slots,
            (SELECT COUNT(*) FROM reservations WHERE status = 'Active') as active_reservations,
            (SELECT COUNT(*) FROM violations WHERE status = 'Open') as open_violations,
            (SELECT COUNT(*) FROM violations WHERE status = 'Under Review') as under_review_violations,
            (SELECT COUNT(*) FROM entry_exit_logs WHERE DATE(entry_time) = CURDATE()) as today_entries,
            (SELECT COUNT(*) FROM entry_exit_logs WHERE DATE(exit_time) = CURDATE()) as today_exits,
            (SELECT COUNT(DISTINCT vehicle_id) FROM entry_exit_logs WHERE DATE(entry_time) = CURDATE()) as today_unique_vehicles
    ");
    $stmt->execute();
    $stats = $stmt->fetch();

    // Calculate parking utilization percentage
    $occupancy_percentage = ($stats['total_slots'] > 0) 
        ? round(((($stats['reserved_slots'] + $stats['occupied_slots']) / $stats['total_slots']) * 100), 2)
        : 0;

    // Get zone-wise distribution
    $stmt = $pdo->prepare("
        SELECT 
            pz.id,
            pz.zone_name,
            pz.zone_code,
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
    $zone_distribution = $stmt->fetchAll();

    // Get violation statistics
    $stmt = $pdo->prepare("
        SELECT 
            violation_type,
            severity,
            COUNT(*) as count,
            status
        FROM violations
        WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY violation_type, severity, status
        ORDER BY count DESC
    ");
    $stmt->execute();
    $violations_data = $stmt->fetchAll();

    // Get peak entry/exit times
    $stmt = $pdo->prepare("
        SELECT 
            HOUR(entry_time) as hour,
            COUNT(*) as entry_count
        FROM entry_exit_logs
        WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY HOUR(entry_time)
        ORDER BY hour
    ");
    $stmt->execute();
    $entry_times = $stmt->fetchAll();

    $stmt = $pdo->prepare("
        SELECT 
            HOUR(exit_time) as hour,
            COUNT(*) as exit_count
        FROM entry_exit_logs
        WHERE exit_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND exit_time IS NOT NULL
        GROUP BY HOUR(exit_time)
        ORDER BY hour
    ");
    $stmt->execute();
    $exit_times = $stmt->fetchAll();

    // Get recent violations
    $stmt = $pdo->prepare("
        SELECT 
            v.id,
            v.registration_number,
            v.violation_type,
            v.severity,
            v.status,
            v.reported_at,
            u.name as reported_by_name
        FROM violations v
        JOIN users u ON v.reported_by = u.id
        ORDER BY v.reported_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recent_violations = $stmt->fetchAll();

    // Get vehicle registration trend (last 30 days)
    $stmt = $pdo->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM vehicles
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    ");
    $stmt->execute();
    $registration_trend = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => [
            'summary' => [
                'verified_vehicles' => (int)$stats['verified_vehicles'],
                'pending_vehicles' => (int)$stats['pending_vehicles'],
                'total_vehicles' => (int)$stats['verified_vehicles'] + (int)$stats['pending_vehicles'],
                'available_slots' => (int)$stats['available_slots'],
                'reserved_slots' => (int)$stats['reserved_slots'],
                'occupied_slots' => (int)$stats['occupied_slots'],
                'maintenance_slots' => (int)$stats['maintenance_slots'],
                'total_slots' => (int)$stats['total_slots'],
                'occupancy_percentage' => $occupancy_percentage,
                'active_reservations' => (int)$stats['active_reservations'],
                'open_violations' => (int)$stats['open_violations'],
                'under_review_violations' => (int)$stats['under_review_violations'],
                'today_entries' => (int)$stats['today_entries'],
                'today_exits' => (int)$stats['today_exits'],
                'today_unique_vehicles' => (int)$stats['today_unique_vehicles']
            ],
            'zone_distribution' => $zone_distribution,
            'violations_data' => $violations_data,
            'entry_times' => $entry_times,
            'exit_times' => $exit_times,
            'recent_violations' => $recent_violations,
            'registration_trend' => $registration_trend
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Dashboard statistics error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch statistics']);
}
