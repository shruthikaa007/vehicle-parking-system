<?php
/**
 * Record Vehicle Exit API
 * POST /api/security/record_exit.php
 */

require_once('../config/database.php');

$user = getAuthUser();
checkRole(['security', 'admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['log_id']) || empty($input['gate_name'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Log ID and gate name are required']);
    exit;
}

$log_id = (int)$input['log_id'];
$gate_name = sanitizeInput($input['gate_name']);

try {
    // Get entry log
    $stmt = $pdo->prepare("
        SELECT vehicle_id, registration_number, entry_time, user_id
        FROM entry_exit_logs
        WHERE id = ? AND exit_time IS NULL
    ");
    $stmt->execute([$log_id]);
    $log = $stmt->fetch();

    if (!$log) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Entry log not found']);
        exit;
    }

    // Calculate duration
    $entry_time = new DateTime($log['entry_time']);
    $exit_time = new DateTime();
    $duration = $exit_time->diff($entry_time);
    $duration_minutes = ($duration->days * 24 * 60) + ($duration->h * 60) + $duration->i;

    // Check if overstay (assume 24 hours max reservation)
    $is_overstay = $duration_minutes > 1440; // More than 24 hours

    // Get vehicle owner if exists
    $vehicle_user_id = null;
    if ($log['vehicle_id']) {
        $stmt = $pdo->prepare("SELECT user_id FROM vehicles WHERE id = ?");
        $stmt->execute([$log['vehicle_id']]);
        $vehicle = $stmt->fetch();
        if ($vehicle) {
            $vehicle_user_id = $vehicle['user_id'];
        }
    }

    // Update exit information
    $stmt = $pdo->prepare("
        UPDATE entry_exit_logs
        SET exit_time = NOW(), 
            exit_gate = ?,
            exit_verified_by = ?,
            duration_minutes = ?,
            is_overstay = ?
        WHERE id = ?
    ");
    $stmt->execute([$gate_name, $user['user_id'], $duration_minutes, $is_overstay, $log_id]);

    // If overstay, create violation
    if ($is_overstay && $log['vehicle_id'] && $vehicle_user_id) {
        $stmt = $pdo->prepare("
            INSERT INTO violations 
            (vehicle_id, registration_number, user_id, violation_type, severity, 
             description, location, status, reported_by)
            VALUES (?, ?, ?, 'Overstay', 'Medium', 
                   'Vehicle exceeded maximum parking duration', ?, 'Open', ?)
        ");
        $stmt->execute([
            $log['vehicle_id'], 
            $log['registration_number'], 
            $vehicle_user_id, 
            $gate_name, 
            $user['user_id']
        ]);
    }

    // Update parking slot status if vehicle has active reservation
    if ($log['vehicle_id']) {
        $stmt = $pdo->prepare("
            UPDATE parking_slots
            SET status = 'Available'
            WHERE id IN (
                SELECT parking_slot_id FROM reservations
                WHERE vehicle_id = ? AND status = 'Active'
                LIMIT 1
            )
        ");
        $stmt->execute([$log['vehicle_id']]);
    }

    // Log audit
    logAudit($user['user_id'], 'UPDATE', 'Exit_Log', $log_id, [
        'registration_number' => $log['registration_number'],
        'gate' => $gate_name,
        'duration_minutes' => $duration_minutes,
        'overstay' => $is_overstay
    ]);

    // Send notification to vehicle owner
    if ($vehicle_user_id) {
        $message = "Your vehicle {$log['registration_number']} exited at {$gate_name} gate. Duration: {$duration_minutes} minutes.";
        if ($is_overstay) {
            $message .= " WARNING: Overstay violation recorded.";
        }
        sendNotification($vehicle_user_id, 'Vehicle Exit Recorded', $message, 'Entry/Exit', $log_id);
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Exit recorded successfully',
        'data' => [
            'log_id' => $log_id,
            'registration_number' => $log['registration_number'],
            'duration_minutes' => $duration_minutes,
            'is_overstay' => $is_overstay,
            'exit_time' => $exit_time->format('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Record exit error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to record exit']);
}
