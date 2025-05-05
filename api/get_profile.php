<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];

// Database connection
require_once 'connect.php';

try {
    // Prepare SQL to get user data with department name
    $sql = "SELECT u.*, d.name as department_name 
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id 
            WHERE u.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Fetch user data
    $userData = $result->fetch_assoc();
    
    // Format user data for response
    $user = [
        'id' => $userData['id'],
        'name' => $userData['name'],
        'email' => $userData['email'],
        'department_id' => $userData['department_id'],
        'department_name' => $userData['department_name'],
        'academic_year' => $userData['academic_year']
    ];
    
    // Return success response with user data
    echo json_encode(['success' => true, 'user' => $user]);
    
} catch (Exception $e) {
    // Log error
    error_log("Error fetching user profile: " . $e->getMessage());
    
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Failed to fetch profile data: ' . $e->getMessage()]);
}

// Close database connection
$conn->close();
?>