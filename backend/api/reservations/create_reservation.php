<?php
/**
 * Create Reservation API
 * POST /api/reservations/create_reservation.php
 * 
 * CRITICAL: Server-side validation for overlapping reservations
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['vehicle_id', 'parking_slot_id', 'reservation_start', 'reservation_end'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field '{$field}' is required"]);
        exit;
    }
}

$vehicle_id = (int)$input['vehicle_id'];
$parking_slot_id = (int)$input['parking_slot_id'];
$reservation_start = sanitizeInput($input['reservation_start']);
$reservation_end = sanitizeInput($input['reservation_end']);

// Validate datetime format
$start_time = DateTime::createFromFormat('Y-m-d H:i', $reservation_start);
$end_time = DateTime::createFromFormat('Y-m-d H:i', $reservation_end);

if (!$start_time || !$end_time) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid datetime format (use Y-m-d H:i)']);
    exit;
}

// Validate time range
if ($end_time <= $start_time) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'End time must be after start time']);
    exit;
}

// Validate future time
$now = new DateTime();
if ($start_time <= $now) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Cannot reserve for past times']);
    exit;
}

try {
    // Start transaction for consistency
    $pdo->beginTransaction();

    // Verify vehicle belongs to user and is verified
    $stmt = $pdo->prepare("
        SELECT id FROM vehicles 
        WHERE id = ? AND user_id = ? AND verification_status = 'Verified' AND is_active = TRUE
    ");
    $stmt->execute([$vehicle_id, $user['user_id']]);
    if (!$stmt->fetch()) {
        throw new Exception('Vehicle not found or not verified');
    }

    // Verify parking slot exists and is available
    $stmt = $pdo->prepare("
        SELECT ps.id, ps.status, pz.zone_name FROM parking_slots ps
        JOIN parking_zones pz ON ps.zone_id = pz.id
        WHERE ps.id = ? AND ps.is_active = TRUE
    ");
    $stmt->execute([$parking_slot_id]);
    $slot = $stmt->fetch();
    if (!$slot) {
        throw new Exception('Parking slot not found');
    }

    // CRITICAL: Check for overlapping reservations (server-side)
    // This prevents race conditions where two requests might try to book the same slot
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as overlap_count FROM reservations
        WHERE parking_slot_id = ? 
        AND status IN ('Active', 'Completed')
        AND (
            (reservation_start < ? AND reservation_end > ?)
            OR (reservation_start < ? AND reservation_end > ?)
            OR (reservation_start >= ? AND reservation_end <= ?)
        )
    ");
    $stmt->execute([
        $parking_slot_id,
        $reservation_end, $reservation_start,  // Existing starts before new ends AND existing ends after new starts
        $reservation_end, $reservation_start,  // Check both conditions
        $reservation_start, $reservation_end   // New is completely within existing
    ]);
    $result = $stmt->fetch();
    
    if ($result['overlap_count'] > 0) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Parking slot is already reserved for the selected time period'
        ]);
        exit;
    }

    // Create reservation
    $stmt = $pdo->prepare("
        INSERT INTO reservations (user_id, vehicle_id, parking_slot_id, reservation_start, reservation_end, status)
        VALUES (?, ?, ?, ?, ?, 'Active')
    ");
    $stmt->execute([$user['user_id'], $vehicle_id, $parking_slot_id, $reservation_start, $reservation_end]);
    
    $reservation_id = $pdo->lastInsertId();

    // Update slot status to Reserved (or Occupied if already occupied)
    $stmt = $pdo->prepare("
        UPDATE parking_slots 
        SET status = 'Reserved' 
        WHERE id = ? AND status = 'Available'
    ");
    $stmt->execute([$parking_slot_id]);

    // Commit transaction
    $pdo->commit();

    // Log audit
    logAudit($user['user_id'], 'CREATE', 'Reservation', $reservation_id, [
        'vehicle_id' => $vehicle_id,
        'parking_slot_id' => $parking_slot_id,
        'zone' => $slot['zone_name']
    ]);

    // Send confirmation notification
    sendNotification($user['user_id'], 'Reservation Confirmed',
        "Your reservation for slot {$slot['zone_name']} from {$reservation_start} to {$reservation_end} is confirmed.",
        'Reservation', $reservation_id);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Reservation created successfully',
        'data' => [
            'reservation_id' => $reservation_id,
            'parking_slot' => $slot['zone_name'],
            'start_time' => $reservation_start,
            'end_time' => $reservation_end
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(400);
    error_log("Create reservation error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
