<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "bare@coat";
$dbname = "sekay";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get user ID from session
session_start();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Fetch user information
$sql = "SELECT name, email, academic_year, department FROM users WHERE id = ?";
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