<?php
// Include database connection
require_once '../api/connect.php';  

// Get user ID from session
session_start();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Fetch user information with department name from departments table
$sql = "SELECT u.name, u.email, u.academic_year, d.name as department 
        FROM users u 
        LEFT JOIN departments d ON u.department_id = d.id 
        WHERE u.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode(['success' => true, 'name' => $user['name'], 'email' => $user['email'], 
                     'academic_year' => $user['academic_year'], 'department' => $user['department']]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

$stmt->close();
$conn->close();
?>