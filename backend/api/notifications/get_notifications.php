<?php
/**
 * Get Notifications API
 * GET /api/notifications/get_notifications.php
 */

require_once('../config/database.php');

$user = getAuthUser();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get pagination parameters
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $unread_only = isset($_GET['unread_only']) ? (bool)$_GET['unread_only'] : false;

    // Build query
    $query = "
        SELECT 
            id,
            title,
            message,
            type,
            is_read,
            read_at,
            created_at
        FROM notifications
        WHERE user_id = ?
    ";
    $params = [$user['user_id']];

    if ($unread_only) {
        $query .= " AND is_read = FALSE";
    }

    // Get total count
    $count_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM notifications WHERE user_id = ?" . ($unread_only ? " AND is_read = FALSE" : ""));
    $count_stmt->execute([$user['user_id']]);
    $count = $count_stmt->fetch()['total'];

    // Get notifications
    $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(1, $user['user_id'], PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $notifications = $stmt->fetchAll();

    // Get notification summary
    $stmt = $pdo->prepare("
        SELECT 
            type,
            COUNT(*) as count,
            SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread
        FROM notifications
        WHERE user_id = ?
        GROUP BY type
    ");
    $stmt->execute([$user['user_id']]);
    $summary = $stmt->fetchAll();

    // Get total unread count
    $stmt = $pdo->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE");
    $stmt->execute([$user['user_id']]);
    $unread_count = $stmt->fetch()['unread_count'];

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $notifications,
        'pagination' => [
            'total' => (int)$count,
            'limit' => $limit,
            'offset' => $offset,
            'pages' => ceil($count / $limit)
        ],
        'summary' => [
            'total' => (int)$count,
            'unread_count' => (int)$unread_count,
            'by_type' => $summary
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get notifications error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch notifications']);
}
